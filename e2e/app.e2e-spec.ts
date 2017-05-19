import { AngularD8Page } from './app.po';

describe('angular-d8 App', () => {
  let page: AngularD8Page;

  beforeEach(() => {
    page = new AngularD8Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
