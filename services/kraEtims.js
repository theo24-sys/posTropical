import axios from "axios";

export class KraEtimsClient {
  constructor({
    baseUrl = process.env.KRA_BASE_URL,
    tin = process.env.KRA_TIN,
    deviceSerial = process.env.KRA_DEVICE_SERIAL,
    cmcKey = process.env.KRA_CMC_KEY || "",
  } = {}) {
    this.baseUrl = (
      baseUrl || "https://etims-api-sbx.kra.go.ke/etims-api"
     )
      .trim()
      .replace(/\/+$/, "");

    this.tin = tin?.trim();
    this.deviceSerial = deviceSerial?.trim();
    this.cmcKey = cmcKey?.trim() || "";

    if (!this.tin) {
      throw new Error("KRA_TIN is missing");
    }

    if (!this.deviceSerial) {
      throw new Error("KRA_DEVICE_SERIAL is missing");
    }
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      cmcKey: this.cmcKey || "",
    };
  }

  async selectInitInfo(branchId = process.env.KRA_BRANCH_ID || "00") {
    const endpoint = `${this.baseUrl}/selectInitInfo`;

    const payload = {
      tin: this.tin,
      bhfId: String(branchId).padStart(2, "0"),
      dvcSrlNo: this.deviceSerial,
    };

    try {
      const response = await axios.post(endpoint, payload, {
        headers: this.getHeaders(),
        timeout: 20_000,
        validateStatus: () => true,
      });

      const { status, data } = response;

      if (status < 200 || status >= 300) {
        throw new Error(
          `HTTP ${status}: ${JSON.stringify(data).slice(0, 1000)}`
        );
      }

      const returnedCmcKey =
        data?.data?.info?.cmcKey ||
        data?.data?.cmcKey ||
        data?.cmcKey;

      if (!returnedCmcKey) {
        throw new Error(
          `KRA did not return cmcKey. Response: ${JSON.stringify(data).slice(
            0,
            1000
          )}`
        );
      }

      this.cmcKey = returnedCmcKey;

      return {
        success: true,
        data,
        cmcKey: this.cmcKey,
      };
    } catch (error) {
      console.error("KRA selectInitInfo failed", {
        endpoint,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      throw new Error(`KRA selectInitInfo failed: ${error.message}`);
    }
  }

  async saveTrnsSalesOsdc(salesPayload) {
    if (!this.cmcKey) {
      throw new Error(
        "cmcKey is missing. Call selectInitInfo() before submitting sales."
      );
    }

    if (!salesPayload || typeof salesPayload !== "object") {
      throw new Error("salesPayload must be an object");
    }

    const endpoint = `${this.baseUrl}/saveTrnsSalesOsdc`;

    try {
      const response = await axios.post(endpoint, salesPayload, {
        headers: this.getHeaders(),
        timeout: 20_000,
        validateStatus: () => true,
      });

      const { status, data } = response;

      if (status < 200 || status >= 300) {
        throw new Error(
          `HTTP ${status}: ${JSON.stringify(data).slice(0, 1000)}`
        );
      }

      return data;
    } catch (error) {
      console.error("KRA saveTrnsSalesOsdc failed", {
        endpoint,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      throw new Error(`KRA saveTrnsSalesOsdc failed: ${error.message}`);
    }
  }
}
