import { Mercaderia } from '../../mercancias/dto/mercaderia.dto';
import { SLCPData } from '../../papeletas/dto/slcp-data.dto';

export interface ExtractionResponse {
  success: boolean;
  data: SLCPData | Mercaderia | null;
  errorMessage: string | null;
  logMessages: string[];
}
