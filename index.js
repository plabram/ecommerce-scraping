const puppeteer = require("puppeteer")
const mongoose = require("mongoose")

const Data = mongoose.model("Data", new mongoose.Schema({
  title: String,
  price: String
}))

const connect = async () => {
  try {
    const URI = "mongodb+srv://freyalabram:zuHTZLPDChlaNcua@testcluster.tsihvlo.mongodb.net/amazon?retryWrites=true&w=majority"
await mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
console.log("connected to db")  
}
   catch {
    console.error("not connected to db") 
  }
}

const scrapeProducts = async () => {
  await connect()
  const url=process.env.URL
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  })

  const page = await browser.newPage()

  await page.goto(url)
  await page.type("#SearchField", "camiseta azul")
  await page.click(".search__submit")
  // await page.waitForSelector(".pagination-button") // page structure has changed, no longer applicable
  const title = await page.$$eval(".product-block__title a",(nodes)=> nodes.map((n)=>n.innerText))
  const price = await page.$$eval(".product-block__price p",(nodes)=> nodes.map((n)=>n.innerText))
  const petitMamarach = title
  .slice(0,5) // uncomment this to receive all results when testing has finished.
  .map((value,index)=>{
    return {
      title: title[index], 
      price: price[index]
    }
  })

  petitMamarach.map(async (data)=>{
    const dataSchema = new Data(data)
    try {
      await dataSchema.save()
      console.log(`Successfully saved ${dataSchema.title}`)
    } catch (error) {
console.error(`Failed to save ${dataSchema.title} to database`)
    }
  })

  await browser.close()
  console.log(`All saved successfully`)
  
}
scrapeProducts()