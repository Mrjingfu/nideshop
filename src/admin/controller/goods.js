const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';

    const model = this.model('goods');
    // const data = await model.where({name: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();

    const goods = await model.where({name: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();
    // 遍历获取分类名称
    const goodsList = [];
    for (const goodItem of goods.data) {
      const good = goodItem;
      const category = await this.model('category').field(['name']).where({id: goodItem.category_id}).find();
      good.category_name = category.name
      goodsList.push(good);
    }
    goods.data = goodsList;

    return this.success(goods);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('goods');
    const data = await model.where({id: id}).find();
    
    const rowcategory = await this.model('category').field(['name']).where({id: data.category_id}).find();
    data.category_name =  rowcategory.name;
    data.allCategory = [];
    const allCategorys = await this.model('category').field(['id','name']).where({parent_id: ['!=',0]}).select();
    for (const categoryItem of allCategorys) {
      const item = {};
      item.id = categoryItem.id;
      item.name = categoryItem.name;
      data.allCategory.push(item);
    }

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('goods');
    values.is_on_sale = values.is_on_sale ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    values.is_hot = values.is_hot ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('goods').where({id: id}).limit(1).delete();
    // TODO 删除图片

    return this.success();
  }
};
