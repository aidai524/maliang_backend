import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomHttpService } from '../../common/providers/custom-http.service';

@Injectable()
export class ProxyService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: CustomHttpService,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get('app');
    this.apiKey = config.thirdPartyApi.apiKey;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async proxyImageGeneration(authHeader: string, generateDto: any): Promise<any> {
    const url = '/v1/images/generate';
    return await this.httpService.proxyPost(url, generateDto, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyGetJobs(
    authHeader: string,
    status?: string,
    limit?: number,
    cursor?: string,
  ): Promise<any> {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;

    const url = '/v1/jobs';
    return await this.httpService.proxyGet(url, params, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyGetJob(authHeader: string, jobId: string): Promise<any> {
    const url = `/v1/jobs/${jobId}`;
    return await this.httpService.proxyGet(url, null, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyCancelJob(authHeader: string, jobId: string): Promise<any> {
    const url = `/v1/jobs/${jobId}`;
    return await this.httpService.proxyDelete(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
