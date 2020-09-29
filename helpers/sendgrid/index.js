import sendgrid from '@sendgrid/mail';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = 'nitzanbenner@gmail.com';
const TEMPLATES = {
    AUTH_CODE: 'd-b02aa43019204ad0acaa894e97b48808',
};

export const sendAuthCodeEmail = async (to, code) => {
    return await sendEmail(to, { code }, TEMPLATES.AUTH_CODE);
};

export const sendEmail = async (to, params, templateId) => {
    const message = {
        to,
        from: {
            name: 'ILCA',
            email: FROM,
        },
        templateId,
        dynamic_template_data: params,
    };

    try {
        await sendgrid.send(message);
    } catch (error) {
        console.log('nitzanDev error', error);
        return Promise.reject(error);
    }
};