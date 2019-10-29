import MailLib from '../../lib/MailLib';

class AnswerHelpMail {
  get key() {
    return 'AnswerHelpMail';
  }

  async handle({ data }) {
    const { studentName, studentEmail, question, answer } = data;

    await MailLib.sendMail({
      to: `${studentName} <${studentEmail}>`,
      subject: 'Pedido de ajuda respondido',
      template: 'answerhelp',
      context: {
        studentName,
        question,
        answer,
      },
    });
  }
}

export default new AnswerHelpMail();
