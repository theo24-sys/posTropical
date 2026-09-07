import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { KraEtimsClient } from "./kraEtimsClient.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function requireEnvironmentVariables() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "KRA_BASE_URL",
    "KRA_TIN",
    "KRA_DEVICE_SERIAL",
    "KRA_BRANCH_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

async function getMenuItemsForKraMapping() {
  /*
    Change "menu_items" and the selected columns if your table has
    a different name.

    Expected example columns:
      id
      name
      price
      kra_item_code
      kra_tax_type
  */

  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `
        id,
        name,
        price,
        kra_item_code,
        kra_tax_type
      `
    )
    .eq("active", true);

  if (error) {
    console.error("Failed to fetch local menu items", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error("Failed to fetch local menu items");
  }

  if (!Array.isArray(data)) {
    throw new Error("Menu-items query did not return an array");
  }

  return data;
}

async function getKraPayload(order) {
  if (!order || !Array.isArray(order.items)) {
    throw new Error("Order must contain an items array");
  }

  const menuItems = await getMenuItemsForKraMapping();

  const menuById = new Map(
    menuItems.map((item) => [String(item.id), item])
  );

  const details = order.items.map((orderItem) => {
    const menuItem = menuById.get(String(orderItem.menuItemId));

    if (!menuItem) {
      throw new Error(
        `No KRA mapping found for menu item ${orderItem.menuItemId}`
      );
    }

    const quantity = Number(orderItem.quantity || 1);
    const unitPrice = Number(
      orderItem.unitPrice ?? menuItem.price ?? 0
    );

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for menu item ${menuItem.id}`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid price for menu item ${menuItem.id}`);
    }

    return {
      itemSeq: orderItem.itemSeq || 1,
      itemCd: menuItem.kra_item_code,
      itemNm: menuItem.name,
      qty: quantity,
      prc: unitPrice,
      taxTyCd: menuItem.kra_tax_type || "B",
      dcRt: 0,
      dcAmt: 0,
      splyAmt: quantity * unitPrice,
      taxAmt: 0,
      totAmt: quantity * unitPrice,
    };
  });

  return {
    /*
      These field names must match the KRA OSCU API specification
      for your registered transaction format.
    */
    tin: process.env.KRA_TIN,
    bhfId: process.env.KRA_BRANCH_ID || "00",
    cmcKey: process.env.KRA_CMC_KEY || undefined,
    orgInvcNo: order.invoiceNumber || order.id,
    custTin: order.customerTin || null,
    custNm: order.customerName || null,
    salesDt: formatKraDate(new Date()),
    salesTyCd: "N",
    rcptTyCd: "S",
    pmtTyCd: order.paymentMethod || "01",
    salesSttsCd: "02",
    totItemCnt: details.length,
    totTaxblAmt: details.reduce(
      (sum, item) => sum + Number(item.splyAmt || 0),
      0
    ),
    totTaxAmt: details.reduce(
      (sum, item) => sum + Number(item.taxAmt || 0),
      0
    ),
    totAmt: details.reduce(
      (sum, item) => sum + Number(item.totAmt || 0),
      0
    ),
    itemList: details,
  };
}

function formatKraDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

const kra = new KraEtimsClient();

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "posTropical",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

app.post("/kra/init", async (_req, res) => {
  try {
    const result = await kra.selectInitInfo(
      process.env.KRA_BRANCH_ID || "00"
    );

    res.status(200).json({
      success: true,
      message: "KRA device initialized successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("KRA initialization failed:", error);

    res.status(502).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/kra/sales", async (req, res) => {
  try {
    if (!kra.cmcKey) {
      await kra.selectInitInfo(process.env.KRA_BRANCH_ID || "00");
    }

    const kraPayload = await getKraPayload(req.body);
    const kraResponse = await kra.saveTrnsSalesOsdc(kraPayload);

    res.status(200).json({
      success: true,
      data: kraResponse,
    });
  } catch (error) {
    console.error("KRA sales submission failed:", error);

    res.status(502).json({
      success: false,
      error: error.message,
    });
  }
});

async function startServer() {
  try {
    requireEnvironmentVariables();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    /*
      Initialize KRA after the server has started.
      A KRA failure should not stop the Render web service.
    */
    try {
      await kra.selectInitInfo(process.env.KRA_BRANCH_ID || "00");
      console.log("KRA device initialized successfully");
    } catch (error) {
      console.error("Initial KRA sync failed:", error.message);
      console.error(
        "The server is still running. KRA initialization will be retried on the next sales request."
      );
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
