import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import { TYPES } from "../../infrastructure/entity/types";
import type { HttpClient } from "../../infrastructure/utils/response/http-client";

@injectable()
export class RecomendationService {
  private errorHandler: ErrorHandler;
  private response: Http;
  private httpClient: HttpClient;

  constructor(
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.http) response: Http,
    @inject(TYPES.httpClient) httpClient: HttpClient
  ) {
    this.errorHandler = errorHandler;
    this.response = response;
    this.httpClient = httpClient;
  }

  async getAll(userId: string) {
    try {
      const data = await this.httpClient.post(
        "https://cf.trisnautama.site/recommend",
        {
          userId,
          ratings: [],
        }
      );
      return data;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async retrainModel() {
    try {
      const result = await this.httpClient.post(
        "http://cf.trisnautama.site/retrain-model",
        {}
      );
      return result;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }
}
