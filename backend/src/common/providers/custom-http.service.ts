import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CustomHttpService {
  private readonly logger = new Logger(CustomHttpService.name);
  private readonly thirdPartyApiBaseUrl: string;
  private readonly requestTimeout = 30000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get('app');
    this.thirdPartyApiBaseUrl = config.thirdPartyApi.baseUrl;
  }

  async proxyRequest<T = any>(
    endpoint: string,
    options?: AxiosRequestConfig,
  ): Promise<T> {
    const url = `${this.thirdPartyApiBaseUrl}${endpoint}`;

    try {
      this.logger.log(`Proxying request to: ${url}`);

      const response = await firstValueFrom(
        this.httpService.request<T>({
          url,
          timeout: this.requestTimeout,
          ...options,
        }),
      );

      this.logger.debug(`Response from: ${endpoint}`, {
        status: response.status,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error proxying request to ${endpoint}:`, error.message);
      throw error;
    }
  }

  async proxyGet<T = any>(endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.proxyRequest<T>(endpoint, {
      method: 'GET',
      params,
      ...config,
    });
  }

  async proxyPost<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.proxyRequest<T>(endpoint, {
      method: 'POST',
      data,
      ...config,
    });
  }

  async proxyPut<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.proxyRequest<T>(endpoint, {
      method: 'PUT',
      data,
      ...config,
    });
  }

  async proxyDelete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.proxyRequest<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }
}
