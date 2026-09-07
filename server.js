import express from "express";
import { createClient } from "@supabase/supabase-js";
import { KraEtimsClient } from "./services/kraEtims.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 10000);
const branchId = String(process.env.KRA_BRANCH_ID || "00").padStart(2, "0");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getSupabase() {
  return createClient(
    required("SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function formatKraDate(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatKraDate(new Date());
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function paymentTypeCode(paymentMethod) {
  return {
    Cash: "01",
    "M-Pesa": "02",
    Card: "03",
    "Pay Later": "04",
  }[paymentMethod] || String(paymentMethod || "01");
}

async function getMenuItemsForKraMapping(itemIds) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, price")
    .in("id", itemIds);

  if (error) {
    console.error("Failed to fetch local menu items", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error("Failed to fetch menu items for KRA mapping");
  }

  return Array.isArray(data) ? data : [];
}

async function getKraPayload(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order must contain a non-empty items array");
  }

  const itemIds = order.items.map((item) => String(item.id ?? item.menuItemId));
  const menuItems = await getMenuItemsForKraMapping(itemIds);
  const menuById = new Map(menuItems.map((item) => [String(item.id), item]));

  const details = order.items.map((orderItem, index) => {
    const id = String(orderItem.id ?? orderItem.menuItemId);
    const menuItem = menuById.get(id);
    if (!menuItem) throw new Error(`Menu item ${id} was not found`);

    const quantity = Number(orderItem.quantity ?? 1);
    const unitPrice = Number(orderItem.price ?? orderItem.unitPrice ?? menuItem.price);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for menu item ${id}`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid price for menu item ${id}`);
    }

    const total = roundMoney(quantity * unitPrice);
    const itemCode = orderItem.item_class_code || orderItem.digitax_item_id || id;

    return {
      itemSeq: index + 1,
      itemCd: itemCode,
      itemNm: menuItem.name,
      qty: quantity,
      prc: unitPrice,
      taxTyCd: orderItem.tax_type_code || "B",
      dcRt: 0,
      dcAmt: 0,
      splyAmt: total,
      taxblAmt: total,
      taxAmt: 0,
      totAmt: total,
    };
  });

  const total = roundMoney(details.reduce((sum, item) => sum + item.totAmt, 0));

  return {
    tin: required("KRA_TIN"),
    bhfId: branchId,
    orgInvcNo: String(order.invoiceNumber || order.orderId || order.id || Date.now()),
    custTin: order.customerTin || order.customerPin || null,
    custNm: order.customerName || null,
    salesDt: formatKraDate(order.date),
    salesTyCd: "N",
    rcptTyCd: "S",
    pmtTyCd: paymentTypeCode(order.paymentMethod),
    salesSttsCd: "02",
    totItemCnt: details.length,
    totTaxblAmt: total,
    totTaxAmt: 0,
    totAmt: total,
    itemList: details,
  };
}

const kra = new KraEtimsClient();

app.get("/", (_req, res) => {
  res.json({ success: true, service: "posTropical", status: "running" });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "healthy", kraInitialized: Boolean(kra.cmcKey) });
});

app.post("/kra/init", async (req, res) => {
  try {
    // Allow overrides from body if provided, fallback to environment
    if (req.body?.cmcKey) kra.integrationToken = req.body.cmcKey;
    if (req.body?.dvcSrlNo) kra.deviceSerial = req.body.dvcSrlNo;
    if (req.body?.tin) kra.tin = req.body.tin;

    const result = await kra.selectInitInfo(req.body?.bhfId || branchId);
    res.json({ success: true, message: "KRA device initialized successfully", data: result.data });
  } catch (error) {
    console.error("KRA initialization failed:", error.message);
    res.status(502).json({ success: false, error: error.message });
  }
});

app.post("/kra/sales", async (req, res) => {
  try {
    if (!kra.cmcKey) await kra.selectInitInfo(branchId);
    const payload = await getKraPayload(req.body);
    const data = await kra.saveTrnsSalesOsdc(payload);
    res.json({ success: true, data });
  } catch (error) {
    console.error("KRA sales submission failed:", error.message);
    res.status(502).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  kra.selectInitInfo(branchId)
    .then(() => console.log("KRA device initialized successfully"))
    .catch((error) => console.error("Initial eTIMS sync failed:", error.message));
});
