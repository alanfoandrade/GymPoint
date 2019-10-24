import Bee from 'bee-queue';
import EnrollMail from '../app/jobs/EnrollMail';
import redisConfig from '../config/redisConfig';
import AnswerHelpMail from '../app/jobs/AnswerHelpMail';

const jobs = [EnrollMail, AnswerHelpMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  /**
   *anexa dados de cada job da fila ao redis
   *bee = conexao com redis
   */
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle
      };
    });
  }

  /**
   * queue = nome da fila
   * job = dados a serem passados para o handle
   */
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  /**
   * job.key = nome do job
   */
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(
      `*******///// A FILA ${job.queue.name} FALHOU! /////*******`,
      err
    );
  }
}

export default new Queue();
