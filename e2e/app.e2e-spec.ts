import { ProyectoNEnLineaPage } from './app.po';

describe('proyecto-nen-linea App', function() {
  let page: ProyectoNEnLineaPage;

  beforeEach(() => {
    page = new ProyectoNEnLineaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
