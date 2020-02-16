import { RouteConfig } from "vue-router";
import config from "@/config/index";
const development = config.development;
interface routerItem {
  children: [];
  path: string;
  meta: {};
}
class Menu {
  constructor() {}
  /**
   * 返回vue-router格式
   * @param menuItem
   * @param originalMenu
   */
  private getRouterItem(menuItem, originalMenu: any[]) {
    const routerItem: RouteConfig = {
      path: menuItem.Url || "",
      name: menuItem.Text,
      component: () => {},
      children: [] as RouteConfig[],
      meta: {
        icon: menuItem.Icon,
        ParentId: menuItem.ParentId,
        Id: menuItem.Id
      }
    };
    if (menuItem.Url) {
      routerItem.component = () =>
        import("@/views" + menuItem.Url + "/index.vue");
    }
    return routerItem;
  }
  /**
   * 返回同一级菜单
   * @param menu
   */
  getParallelMenu(menu: any[]) {
    if (development) {
      menu = require("@/subMenu.json");
    }
    return _.map(menu, menuItem => {
      return this.getRouterItem(menuItem, menu);
    });
  }
  /**
   * 返回tree格式菜单 async
   */
  getTreeMenu(menu: any[]) {
    if (development) {
      menu = require("@/subMenu.json");
    }
    return this.recursionTree(menu);
  }

  /**
   * 递归 格式化 树
   * @param datalist
   * @param ParentId 父级id
   * @param children
   * @param originalMenu 原始数据
   */
  private recursionTree(
    datalist,
    ParentId = null,
    children: RouteConfig[] = [],
    originalMenu: any[] = []
  ): RouteConfig[] {
    _.filter(datalist, ["ParentId", ParentId]).map(menuItem => {
      const routerItem: RouteConfig = this.getRouterItem(
        menuItem,
        originalMenu
      );
      routerItem.children = this.recursionTree(
        datalist,
        menuItem.Id,
        menuItem.children || [],
        originalMenu
      );
      children.push(routerItem);
    });
    return children;
  }

  /**
   * tree打平一级菜单
   */
  generateRoutesFromMenu(
    menu,
    routes: Array<routerItem> = [],
    parentMenu?: routerItem
  ) {
    for (let i = 0, l = menu.length; i < l; i++) {
      const item: routerItem = menu[i];
      if (item.path) {
        item.meta["parentMenu"] = parentMenu;
        const itemClone = { ...item };
        delete itemClone.children;
        routes.push(itemClone);
      }
      if (item.children) {
        this.generateRoutesFromMenu(item.children, routes, item);
      }
    }
    return routes;
  }
}
export default new Menu();