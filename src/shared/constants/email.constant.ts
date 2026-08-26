export enum EmailTemplateEnum {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
}
export type IEmailTemplate = `${EmailTemplateEnum}`;
export const EMAIL_TEMPLATE_VALUES = Object.values(EmailTemplateEnum);

export const TEMPLATES: Record<
  string,
  (data: Record<string, unknown>) => { subject: string; body: string }
> = {
  [EmailTemplateEnum.WELCOME]: (data) => ({
    subject: `Welcome, ${data.name as string}!`,
    body: `Hi ${data.name as string}, thanks for signing up. We're glad you're here.`,
  }),
  [EmailTemplateEnum.PASSWORD_RESET]: (data) => ({
    subject: 'Reset your password',
    body: `Click here to reset your password: ${data.resetLink as string}`,
  }),
};
