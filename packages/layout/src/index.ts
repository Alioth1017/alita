import { IApi, utils } from 'umi';
import { join } from 'path';
import getLayoutContent from './utils/getLayoutContent';
import getModelContent from './utils/getModelContent';

const DIR_NAME = 'alita-layout';
const MODEL_NAME = 'layoutState';
const RELATIVE_MODEL = join(DIR_NAME, MODEL_NAME);
const RELATIVE_MODEL_PATH = `${RELATIVE_MODEL}.ts`;

export default (api: IApi) => {
  if (!api.userConfig.mobileLayout) return;
  const isMicroApp = api.userConfig.appType === 'micro';

  api.describe({
    key: 'mobileLayout',
    config: {
      default: {},
      schema(joi) {
        return joi.boolean();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // 注册runtime配置
  api.addRuntimePluginKey(() => 'mobileLayout');

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: join(DIR_NAME, 'AlitaLayout.tsx'),
      content: getLayoutContent(
        utils.winPath(join(__dirname, './layout/index.js')),
        !!api.userConfig.keepalive,
        isMicroApp
      ),
    });
    api.writeTmpFile({
      path: RELATIVE_MODEL_PATH,
      content: getModelContent(),
    });
  });

  api.modifyRoutes((routes) => [
    {
      path: '/',
      component: utils.winPath(
        join(api.paths.absTmpPath || '', DIR_NAME, 'AlitaLayout.tsx'),
      ),
      routes,
    },
  ]);

  api.addUmiExports(() => [
    {
      specifiers: ['getPageNavBar', 'setPageNavBar', 'setTabBarList', 'getTabBarList', 'layoutEmitter'],
      source: `../${RELATIVE_MODEL}`,
    },
    {
      exportAll: true,
      source: '@alitajs/alita-layout',
    },
  ]);
};
