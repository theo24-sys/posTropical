import axios from 'axios';
import { KraItemPayload, eTimsInvoicePayload } from '../types';

export class KraEtimsClient {
  private baseUrl: string;
  private tin: string;
  private deviceSerial: string;

  constructor(baseUrl: string, tin: string, deviceSerial: string) {
    this.baseUrl = baseUrl;
    this.tin = tin;
    this.deviceSerial = deviceSerial;
  }

  /**
   * Performs VSCU/OSCU terminal binding initialization step
   */
  async initializeDevice(certKey: string): Promise<any> {
    const endpoint = `${this.baseUrl}/initializer/selectDeviceInfo`;
    const payload = {
      tin: this.tin,
      bhfId: '00', // Default Headquarter branch index allocation
      dvcSrlNo: this.deviceSerial,
      certKey: certKey
    };

    const { data } = await axios.post(endpoint, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return data;
  }

  /**
   * Transmits realtime transactions directly to KRA ledger systems
   */
  async transmitInvoice(invoice: eTimsInvoicePayload, sessionToken: string): Promise<any> {
    const endpoint = `${this.baseUrl}/trnsSales/saveTrnsSales`;
    
    const { data } = await axios.post(endpoint, invoice, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });
    return data;
  }
}
