import MailLib from '../../lib/MailLib';

class EnrollMail {
  get key() {
    return 'EnrollMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      planTitle,
      planLength,
      planPrice,
      enrollStartDate,
      enrollEndDate,
      enrollPrice,
    } = data;

    await MailLib.sendMail({
      to: `${studentName} <${studentEmail}>`,
      subject: 'Matrícula confirmada',
      template: 'enrollment',
      context: {
        studentName,
        planTitle,
        planLength,
        planPrice,
        enrollStartDate,
        enrollEndDate,
        enrollPrice,
      },
    });
  }
}

export default new EnrollMail();
