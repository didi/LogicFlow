import { IApi } from 'dumi';

export default (api: IApi) => {
  api.addHTMLScripts(
    () => `
    window.onload = function() {
      const endTime = Math.ceil(new Date().getTime() / 1000);
      const loadingTime = endTime - startTime;
      console.log('startTime', startTime, 'endTime', endTime);
      const en = window.location.href.includes("en");
      const language = en ? "en" : "zh";
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform;
      Omega.trackEvent('tech_user_info', 'tech_urser_info', {
        language,
        userAgent,
        platform,
        loadingTime,
      })
      console.warn('I', language, userAgent, platform, loadingTime)
    }
  `,
  );
};
