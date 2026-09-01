import { SetMetadata } from '@nestjs/common';

export const TRACE_REQUEST_ID_KEY = 'trace_request_id';
export const TraceRequestId = () => SetMetadata(TRACE_REQUEST_ID_KEY, true);
