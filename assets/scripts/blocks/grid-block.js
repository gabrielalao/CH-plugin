/* This section of the code registers a new block, sets an icon and a category, and indicates what type of fields it'll include. */
  
wp.blocks.registerBlockType('crystal-helper/grid-product', 
  {
    title: 'Grid Product',
    icon: 'screenoptions',
    category: 'crystal-helper',
    edit: function(props) {
      
      if ($("[aria-label='Block: Classic']").length === 0) {       
        $("[aria-label='Classic']").click();
      }
      
      if (props.className === "wp-block-crystal-helper-grid-product" && props.isSelected === true){
        if( CrystalCatalogHelper.Modal.modalFlag === 0) {          
          openModal();
        }              
        CrystalCatalogHelper.Modal.modalCount = CrystalCatalogHelper.Modal.modalCount + 1;
        CrystalCatalogHelper.Modal.modalFlag = (CrystalCatalogHelper.Modal.modalFlag + 1) % 2;

        if(CrystalCatalogHelper.Modal.modalCount > 2)
        {
          CrystalCatalogHelper.Modal.modalCount = 3;
        } else if(CrystalCatalogHelper.Modal.modalCount === 1)
        {
          CrystalCatalogHelper.Modal.modalFlag = 0;
        }
      }

      async function openModal() {
        let promise = new Promise(resolve => {
          setTimeout(() => resolve(true), 300);
        });
        
        promise.then((result) => {
          if ($("[aria-label='Block: Classic']").length !== 0 && result === true) {
            CrystalCatalogHelper.Grid.openModal("");
          }
        });
      }
      
      return null;
    },
    save: function(props) {
      return wp.element.createElement(
        "h3",
        props.attributes.content
      );
    }
  }
)
