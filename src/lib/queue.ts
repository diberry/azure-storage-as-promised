import azure = require('azure-storage');

export class Queue {
  private queueService: any;

  /**
   *
   * @param connectionString - Azure Storage connection string
   */
  constructor(connectionString) {
    this.queueService = new azure.QueueService(connectionString);
  }
  /**
   *
   * @param queue
   * @param messageText
   * @param options
   */
  public async addMessage(queue, messageText, options) {
    const self = this;

    if (!queue || !messageText) {
      throw Error('Queue - params missing');
    }

    return new Promise((resolve, reject) => {
      self.queueService.createQueueIfNotExists(queue, options, error => {
        if (error) {
          throw error;
        }

        self.queueService.createMessage(queue, messageText, (error2, result) => {
          if (error2) {
            reject(error2);
          }
          resolve(result);
        });
      });
    });
  }
  /**
   *
   * @param queue
   * @param options
   */
  public async getMessage(queue, options) {
    const self = this;

    if (!queue) {
      throw Error('Queue - params missing');
    }

    return new Promise((resolve, reject) => {
      self.queueService.getMessage(queue, options, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }
  /**
   *
   * @param queue
   * @param messageId
   * @param popReceipt
   * @param options
   */
  public async deleteMessage(queue, messageId, popReceipt, options) {
    const self = this;

    if (!queue || !messageId || !popReceipt) {
      throw Error('Queue - params missing');
    }

    return new Promise((resolve, reject) => {
      self.queueService.deleteMessage(queue, messageId, popReceipt, options, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }
}
