import axios from 'axios';

export class KraEtimsClient {
  constructor(baseUrl, tin, deviceSerial, cmcKey = '') {
    this.baseUrl = baseUrl || 'https://etims-api-sbx.kra.go.ke/etims-api';
    this.tin = tin;
    this.deviceSerial = deviceSerial;
    this.cmcKey = cmcKey;
  }

  /**
   * Initializes OSCU device and retrieves the cmcKey directly from KRA
   */
  async selectInitInfo(branchId = '00') {
    const endpoint = `${this.baseUrl}/selectInitInfo`;
    const payload = {
      tin: this.tin,
      bhfId: branchId,
      dvcSrlNo: this.deviceSerial
    };

    const { data } = await axios.post(endpoint, payload, {
      headers: { 
        'Content-Type': 'application/json',
        'cmcKey': this.cmcKey || '' 
      }
    });

    if (data?.data?.info?.cmcKey) {
      this.cmcKey = data.data.info.cmcKey;
    }

    return data;
  }

  /**
   * Transmits real-time OSCU transaction payloads to KRA
   */
  async saveTrnsSalesOsdc(salesPayload) {
    const endpoint = `${this.baseUrl}/saveTrnsSalesOsdc`;

    const { data } = await axios.post(endpoint, salesPayload, {
      headers: {
        'Content-Type': 'application/json',
        'cmcKey': this.cmcKey
      }
    });
    return data;
  }
}
