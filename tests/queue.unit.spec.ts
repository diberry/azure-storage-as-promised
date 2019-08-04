require('dotenv').config();

import { Queue } from "../src/index";

describe('Queue', () => {

    it('should manage queue ', async (done) => {

        try {
            jest.setTimeout(99000);
            const timeStamp = (+new Date).toString();     

            const queueName = `test${timeStamp}`;
            const message = `jest test ${timeStamp}`;
            const options = {
                clientRequestId: "diberry"
            };

            const queue = new Queue(process.env.AZURESTORAGECONNECTIONSTRING);

            // create message
            const createMessageResult:any = await queue.addMessage(queueName, message, options);
            expect(createMessageResult.messageId).not.toEqual(undefined);

            // get message
            const getMessageResult:any = await queue.getMessage(queueName, options);
            expect(getMessageResult.messageId).not.toEqual(undefined);
            expect(getMessageResult.messageText).toEqual(message);

            // delete message
            const deleteMessageResult:any = await queue.deleteMessage(queueName, getMessageResult.messageId, getMessageResult.popReceipt, options);   
            expect(deleteMessageResult.isSuccessful).toEqual(true);

            done();

        } catch(err){
            done(err);
        }

    });    
}); 