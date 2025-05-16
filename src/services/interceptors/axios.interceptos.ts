
import { ConflictError, HttpError, InternalServerError, NotFoundError, UnauthorizedError } from "@/components/errors/http_errors"; 
import axios, { AxiosInstance, } from "axios";


export function axiosInterceptors(apiInstance: AxiosInstance) {
    const MAX_RETRIES = 3;

    apiInstance.interceptors.response.use(
        response => response,
        async (error) => {
            if (axios.isAxiosError(error)) {
                const { config, response } = error;

                // Retry logic for transient errors
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (config && response && response.status >= 500 && (config as any).__retryCount < MAX_RETRIES) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (config as any).__retryCount = (config as any).__retryCount || 0;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (config as any).__retryCount += 1;
                    return apiInstance(config);
                }

                if (response) {
                    switch (response.status) {
                        case 401:
                            throw new UnauthorizedError(response.data.error || 'Unauthorized');
                        case 409:
                            throw new ConflictError(response.data.error || 'Conflict');
                        case 404:
                            throw new NotFoundError(response.data.error || 'Not Found');
                        case 500:
                            throw new InternalServerError(response.data.error || 'Internal Server Error');
                        default:
                            throw new HttpError(response.data.error || 'An unexpected error occurred');
                    }
                } else if (error.request) {
                    throw new HttpError('No response received from the server');
                } else {
                    throw new HttpError(error.message);
                }
            } else {
                throw new Error('An unknown error occurred');
            }
        }
    );
}