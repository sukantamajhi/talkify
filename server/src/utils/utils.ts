import path from 'path';
import { compileTemplate } from '../services/EmailService';
import logger from '../../logger';

interface IConvertHtmlToHbs {
    templateName: string;
    data: Record<string, any>;
}

export const convertHtmlToHbs = async ({
    templateName,
    data,
}: IConvertHtmlToHbs) => {
    try {
        const templatePath = path.join(
            __dirname,
            `../email-templates/${templateName}.html`
        );

        // Compile email template
        const emailHtml = await compileTemplate(templatePath, data);

        return emailHtml;
    } catch (error) {
        logger.error(error, '<<-- Error in convertHtmlToHbs');
    }
};
