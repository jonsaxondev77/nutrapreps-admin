import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRedirect } from "./baseQuery";

interface SendBulkMessageRequest {
  phoneNumbers: string[];
  message: string;
}

interface SendBulkMessageResponse {
  message: string;
  successfulSends: string[];
  failedSends: { phoneNumber: string; error: any }[];
}

export const whatsappApi = createApi({
  reducerPath: "whatsappApi",
  baseQuery: baseQueryWithRedirect,
  endpoints: (builder) => ({
    sendWhatsAppMessage: builder.mutation<unknown, { to: string; message: string }>({
      query: (body) => ({
        url: 'whatsapp/send-message',
        method: 'POST',
        body: body,
      }),
    }),
    sendBulkWhatsAppMessage: builder.mutation<SendBulkMessageResponse, SendBulkMessageRequest>({
      query: (body) => ({
        url: 'whatsapp/send-bulk-message',
        method: 'POST',
        body: body,
      }),
    }),
  }),
});

export const { useSendWhatsAppMessageMutation, useSendBulkWhatsAppMessageMutation } = whatsappApi;