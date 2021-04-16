import sendgrid from '@sendgrid/mail';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = process.env.SENGRID_FROM;
const TEMPLATES = {
    AUTH_CODE: process.env.SENDGRID_AUTH_CODE_TEMPLATE,
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
