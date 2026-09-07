import axios from "axios";

const DEFAULT_BASE_URL = "https://etims-api-sbx.kra.go.ke";

function responsePreview(value) {
  try {
    return JSON.stringify(value).slice(0, 1000);
  } catch {
    return String(value).slice(0, 1000);
  }
}

export class KraEtimsClient {
  constructor({
    baseUrl = process.env.KRA_BASE_URL,
    tin = process.env.KRA_TIN,
    deviceSerial = process.env.KRA_DEVICE_SERIAL,
    cmcKey = process.env.KRA_CMC_KEY || "",
    integrationToken = process.env.KRA_INTEGRATION_TOKEN || process.env.KRA_TOKEN || "",
  } = {}) {
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
    this.tin = tin?.trim();
    this.deviceSerial = deviceSerial?.trim();
    this.cmcKey = cmcKey?.trim() || "";
    this.integrationToken = integrationToken?.trim() || "";

    if (!this.tin) throw new Error("KRA_TIN is missing");
    if (!this.deviceSerial) throw new Error("KRA_DEVICE_SERIAL is missing");
  }

  headers(authenticationKey = this.cmcKey || this.integrationToken) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      cmcKey: authenticationKey,
    };
  }

  async post(path, payload, authenticationKey) {
    const endpoint = `${this.baseUrl}/${path.replace(/^\/+/, "")}`;

    try {
      const response = await axios.post(endpoint, payload, {
        headers: this.headers(authenticationKey),
        timeout: 20000,
        validateStatus: () => true,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `HTTP ${response.status}: ${responsePreview(response.data)}`
        );
      }

      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const body = error.response?.data;
      console.error(`KRA ${path} failed`, {
        endpoint,
        status,
        response: body,
        message: error.message,
      });
      throw new Error(
        `KRA ${path} failed: ${status ? `HTTP ${status}` : error.message}`
      );
    }
  }

  async selectInitInfo(branchId = process.env.KRA_BRANCH_ID || "00") {
    if (!this.integrationToken && !this.cmcKey) {
      throw new Error(
        "KRA_INTEGRATION_TOKEN is missing; add the token supplied by KRA"
      );
    }

    const data = await this.post("selectInitInfo", {
      tin: this.tin,
      bhfId: String(branchId).padStart(2, "0"),
      dvcSrlNo: this.deviceSerial,
    }, this.integrationToken || this.cmcKey);

    const returnedCmcKey =
      data?.data?.info?.cmcKey || data?.data?.cmcKey || data?.cmcKey;

    if (!returnedCmcKey) {
      throw new Error(
        `KRA selectInitInfo returned no cmcKey: ${responsePreview(data)}`
      );
    }

    this.cmcKey = returnedCmcKey;
    return { data, cmcKey: this.cmcKey };
  }

  async saveTrnsSalesOsdc(salesPayload) {
    if (!this.cmcKey) {
      throw new Error("cmcKey is missing; initialize the KRA device first");
    }
    return this.post("saveTrnsSalesOsdc", salesPayload);
  }
}

export default KraEtimsClient;
