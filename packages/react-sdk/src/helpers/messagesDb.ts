import type { DecodedMessage } from "@xmtp/xmtp-js";
import type { Table } from "dexie";
import { Dexie } from "dexie";
import { getConversationId } from "./getConversationId";

export type CachedMessage = {
  id: string;
  cId: string;
  bytes: Uint8Array;
  recipientAddress?: string;
  senderAddress: string;
  sent: Date;
};

export class MessagesDB extends Dexie {
  messages!: Table<CachedMessage>;

  constructor() {
    super("__XMTP__");
    this.version(1).stores({
      messages: "id, [cId+sent]",
    });
  }

  // persist message to cache
  async persistMessage(message: DecodedMessage) {
    const { id, sent, recipientAddress, senderAddress } = message;
    await this.messages.put(
      {
        id,
        cId: getConversationId(message.conversation),
        bytes: message.toBytes(),
        recipientAddress,
        senderAddress,
        sent,
      },
      [id, sent],
    );
  }
}

export const messagesDb = new MessagesDB();
