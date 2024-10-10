import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

function main() {
  console.log(serverUrl);
}

interface Filter {
  color: string[],
  size: string[],
  price: string[]
}

const filters: Filter = {
  color: [],
  size: [],
  price: []
}

//Global Variables
let productList: Product[] = [];
let orderBySelected = "recentes";
let loadMore = false;
let  allProducts: any = []
const filterColor = new Set();
const minicart = new Map()
// End Global Variables


function openMinicart(){
  document.querySelector('.minicartShelfContainer').classList.add("active")
}

function buildMinicart(){
  const itemsContainer = document.querySelector(".minicartItems")
  let totalValue = 0;

  itemsContainer.innerHTML = ""
  if(minicart.size == 0){
    itemsContainer.innerHTML = "Oops, seu carrinho está vazio!"
    return;
  }
  minicart.forEach((value, key)=>{
    if(value == 0) return;
    const itemFilter:Product = allProducts.filter((item: Product) => {return item.id == key})[0]
    const itemContainer = document.createElement("div")
    itemContainer.classList.add(`minicartItemContainer`)
    const itemImage = document.createElement("img")
    itemImage.src = itemFilter.image

    const infoContainer = document.createElement("div")

    const productTitle = document.createElement("p")
    productTitle.innerHTML = itemFilter.name;
    productTitle.classList.add("productName")
    infoContainer.append(productTitle)

    const productPrice = document.createElement("p")
    productPrice.innerHTML = `R$ ${itemFilter.price.toFixed(2).toString().replace(".",",")}`
    productPrice.classList.add(`productPrice`)
    infoContainer.append(productPrice)

    const productQuantity = document.createElement("p")
    productQuantity.innerHTML = `Quantidade: ${value}`
    infoContainer.append(productQuantity)

    const removeFromCart = document.createElement('img')
    removeFromCart.src = "./img/trash-blank.png"
    removeFromCart.classList.add("removeFromMinicart")
    removeFromCart.addEventListener("click", ()=>deleteFromCart(key))
    infoContainer.append(removeFromCart)



    itemContainer.append(itemImage)
    itemContainer.append(infoContainer)
    itemsContainer.append(itemContainer)
    totalValue += itemFilter.price * value;
  })

  document.querySelector(".minicartTotal").innerHTML = `R$ ${totalValue.toFixed(2).toString().replace(".", ",")}`
}

function addToCart(id: string){
  minicart.get(id) ? minicart.set(id, minicart.get(id) + 1) : minicart.set(id, 1)
  buildMinicart()
  openMinicart()
}

function deleteFromCart(id: string){
  minicart.set(id, 0)
  buildMinicart()
}

function sortProducts(order: string) {
    switch (order) {
        case 'recentes':
            productList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
        case 'menorpreco':
            productList.sort((a, b) => a.price - b.price);
            break;
        case 'maiorpreco':
            productList.sort((a, b) => b.price - a.price);
            break;
        default:
            break;
    }
}

function buildShelf(){
  const shelf = document.querySelector("#products")
  shelf.innerHTML = null;
  let itemsToDispaly:HTMLDivElement[] = [];

  sortProducts(orderBySelected);

  productList.map(item=>{
    
    if(filters.color.length > 0 && !filters.color.includes(item.color)){
      return;
    };

    if(filters.size.length > 0 && item.size.filter(itm=> {return filters.size.includes(itm)}).length == 0){
      return
    };
    if(filters.price.length > 0 && filters.price.filter(itm=> {
        return item.price > Number.parseInt(itm.split("-")[0]) && item.price < Number.parseInt(itm.split("-")[1])
    }).length == 0){
        return
    }
    itemsToDispaly.push(createProductCard(item))
  })

  if(!loadMore) itemsToDispaly = itemsToDispaly.slice(0, 9)
  itemsToDispaly.forEach(item=>{
    shelf.append(item)
  })
}

function handleFormChange() {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("form")?.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.name in filters) {
        const key = target.name as keyof Filter;
        
        if (target.checked) {
          filters[key] = [...filters[key], target.value];
        } else {
          filters[key] = filters[key].filter(item => item !== target.value);
        }
      }

      buildShelf()
    });
  });
}

function createProductCard({image, name, parcelamento, price, id}: Product):HTMLDivElement{
  const productContainer = document.createElement('div')

  const productImage = document.createElement('img')
  productImage.src = image;

  const productName = document.createElement('h2')
  productName.innerHTML = name;
  productName.className = "productName"

  const productPrice = document.createElement('p')
  productPrice.className = "productPrice";
  productPrice.innerHTML = `R$ ${price.toFixed(2).toString().replace(".", ",")}`

  const productInstallment = document.createElement('p')
  productInstallment.className = "productInstallment"
  productInstallment.innerHTML = `até ${parcelamento[0]}x de R$${parcelamento[1].toFixed(2).toString().replace(".", ",")}`

  const buyButton = document.createElement('button')
  buyButton.innerHTML = "COMPRAR"
  buyButton.addEventListener("click", ()=>{
    addToCart(id)
  })

  productContainer.append(productImage);
  productContainer.append(productName);
  productContainer.append(productPrice);
  productContainer.append(productInstallment);
  productContainer.append(buyButton);

  return productContainer
}

function createSizeSelector(item: string):HTMLDivElement{
  const element = document.createElement("div");
  
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = item;
  input.name = "size"
  input.value = item
  input.className = "sizeCheckbox"

  const label = document.createElement("label")
  label.innerHTML = item;
  label.htmlFor = item;

  element.append(input);
  element.append(label)

  return element
}

function build() {
  fetch('http://localhost:5000/products').then(res => res.text())
  .then(data => {
    const jdata = JSON.parse(data);
    const filterColorContainer = document.querySelector(".filterColors")
    const filterSizeContainer = document.querySelector(".filterSizes .checkbox-grid")
    
    const filterSize = new Set();
    const productElementList = [];
    productList = jdata;
    allProducts = jdata;
    
    jdata.forEach((item: Product)=>{
      const productCard = createProductCard(item);
      productElementList.push(productCard)
      filterColor.add(item.color)
      item.size.forEach(isize => filterSize.add(isize))
    })

    for(let i = 0; i < Array.from(filterColor).length; i++){
      const element = document.createElement("input");
      element.type = "checkbox"
      element.name = "color"
      element.value = (Array.from(filterColor)[i] as string);
      element.id = (Array.from(filterColor)[i] as string);

      const elementsContainer = document.createElement('label')
      elementsContainer.className = "colorContainer";
      elementsContainer.htmlFor = (Array.from(filterColor)[i] as string);

      const label = document.createElement('label')
      label.htmlFor = (Array.from(filterColor)[i] as string)
      label.innerHTML = (Array.from(filterColor)[i] as string)

      const pseudoSelector = document.createElement('div')
      pseudoSelector.append(document.createElement('div'))

      elementsContainer.append(element)
      elementsContainer.append(pseudoSelector)
      elementsContainer.append(label)

      i >= 5 ? elementsContainer.classList.add("hideMoreColor") : null
      filterColorContainer.prepend(elementsContainer)
    }

    Array.from(filterSize).sort().forEach((item:string)=>{
      filterSizeContainer.append(createSizeSelector(item))
    })

    buildShelf()
    buildMinicart()

    document.querySelector("#orderByRecent").addEventListener("click", ()=> {
      orderBySelected = "recentes";
      document.querySelector(".orderBy").classList.remove("show")
      buildShelf()
    })
    document.querySelector("#orderByCheapest").addEventListener("click", ()=> {
      orderBySelected = "menorpreco";
      document.querySelector(".orderBy").classList.remove("show")
      buildShelf()
    })
    document.querySelector("#orderByExpensive").addEventListener("click", ()=> {
      orderBySelected = "maiorpreco";
      document.querySelector(".orderBy").classList.remove("show")
      buildShelf()
    })

    document.querySelector("#loadMore").addEventListener("click", ()=>{
        loadMore = true;
        document.querySelector("#loadMore").classList.add("hidden")
        buildShelf()
    })

    document.querySelector(".showAllColors").addEventListener("click", ()=>{
        document.querySelector(".showAllColors").classList.add("hidden");
        document.querySelectorAll(".hideMoreColor").forEach(element=> element.classList.remove("hideMoreColor"))
    })

    document.querySelector("#filterButton").addEventListener("click", ()=>{
        document.querySelector("#filters").classList.add("show")
    })

    document.querySelector(".closeFilters").addEventListener("click", ()=>{
        document.querySelector("#filters").classList.remove("show")
    })

    document.querySelector("#clearFilter").addEventListener("click", ()=>{
      document.querySelector("#filters").querySelectorAll('input').forEach(item=> {item.checked = false})
      filters.color = []
      filters.size = []
      filters.price = []
      buildShelf()
      document.querySelector("#filters").classList.remove("show")
    })

    document.querySelector("#applyFilter").addEventListener("click", ()=>{
      document.querySelector("#filters").classList.remove("show")
    })

    document.querySelector("#orderButton").addEventListener("click", ()=>{
      document.querySelector(".orderBy").classList.add("show")
    })

    document.querySelector("#closeOrder").addEventListener("click", ()=>{
      document.querySelector(".orderBy").classList.remove("show")
    })

    document.querySelectorAll(".filterTitle").forEach(item=>{
      item.addEventListener("click", ()=>{
        item.classList.contains("show") ? item.classList.remove("show") : item.classList.add("show")
      })
    })

    document.querySelector("#minicartContainer").addEventListener("click", ()=>{
      openMinicart()
    })

    document.querySelector(".closeMinicart").addEventListener("click", ()=>{
      document.querySelector('.minicartShelfContainer').classList.remove("active")
    })
  })
  .catch(error => {
    throw new Error(error)
  });
}

(window as any).build = build;
(window as any).handleFormChange = handleFormChange;


document.addEventListener("DOMContentLoaded", main);