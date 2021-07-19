import generatePlaygroundJson from './generate-playground-json.mjs'

const playgroundJson = {
  name: 'playgroundJson',
  serve(context) {
    return new Promise((resolve) => {
      const exampleMatch = context.path.match(/([\w|-]*?)\.playground\.json/);
      if (exampleMatch) {
       const name = exampleMatch[1];

       const jsonObject = generatePlaygroundJson(name);
       resolve(JSON.stringify(jsonObject));
      } else {
        resolve();
      }
    });
  }
}

export default playgroundJson;
