const client = require("./client");

async function getRentalsTotals(channelid) {
  try {
    const { rows } = await client.query(
      `
         SELECT
         COALESCE(SUM(videoprice),0) AS earningstotal
         FROM movierental_orders
         WHERE channelid=$1;
       `,
      [channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getRentalsTotalsDates(channelid, fromdt, thrudt) {
  try {
    const { rows } = await client.query(
      `
         SELECT
         COALESCE(SUM(videoprice),0) AS earningstotal
         FROM movierental_orders
         WHERE channelid=$1 AND rental_date BETWEEN '${fromdt}' AND '${thrudt}';
       `,
      [channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getMarketTotals(vendorid) {
  try {
    const { rows } = await client.query(
      `
         SELECT
         COALESCE(SUM(purchase_total),0) AS earningstotal
         FROM customer_product_orders
         WHERE vendorid=$1;
       `,
      [vendorid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}


async function getMarketTotalsDates(vendorid, fromdt, thrudt) {
  try {
    const { rows } = await client.query(
      `
         SELECT
         COALESCE(SUM(purchase_total),0) AS earningstotal
         FROM customer_product_orders
         WHERE vendorid=$1 AND product_orderdt BETWEEN '${fromdt}' AND '${thrudt}';
       `,
      [vendorid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getChannelSubscribers(id) {
  try {
    const { rows } = await client.query(
      `
         SELECT *
         FROM users_channel
         WHERE id=$1;
       `,
      [id]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getTotalChannelLikes(channelid) {
  try {
    const { rows } = await client.query(
      `
        SELECT
        COALESCE(SUM(videolikecount),0) AS totallikes
        FROM useruploads
        WHERE channelid=$1;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getTotalChannelDisLikes(channelid) {
  try {
    const { rows } = await client.query(
      `
        SELECT
        COALESCE(SUM(videodislikecount),0) AS totaldislikes
        FROM useruploads
        WHERE channelid=$1;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getTotalChannelViews(channelid) {
  try {
    const { rows } = await client.query(
      `
        SELECT
        COALESCE(SUM(videoviewcount),0) AS totalviews
        FROM useruploads
        WHERE channelid=$1;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getTotalChannelComments(channelid) {
  try {
    const { rows } = await client.query(
      `
        SELECT COUNT(*)
        FROM useruploads
        RIGHT JOIN uploadcomments ON useruploads.id = uploadcomments.videoid
        WHERE channelid=$1;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getTotalProductOrders(vendorid) {
  try {
    const { rows } = await client.query(
      `
        SELECT COUNT(*)
        FROM customer_product_orders
        WHERE vendorid=$1;
       `,
      [vendorid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}


async function getTotalRentalOrders(channelid) {
  try {
    const { rows } = await client.query(
      `
        SELECT COUNT(*)
        FROM movierental_orders
        WHERE channelid=$1;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}


async function getChannelRentals(channelid) {
  
  try{
    const { rows } = await client.query(`
    SELECT movierental_orders.videotitle, COUNT(*) AS count, to_char(DATE(movierental_orders.rental_date)::date, 'MM/DD/YYYY') as dateFormatted, useruploads.*
    FROM movierental_orders
    RIGHT JOIN useruploads ON movierental_orders.videoid = useruploads.id
    WHERE movierental_orders.channelid=$1
    GROUP BY movierental_orders.videotitle, useruploads.id, movierental_orders.rental_date
    ORDER BY movierental_orders.rental_date DESC;
 
  `,[channelid]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get channel rentals", error);
  }
  
}

async function getMarketBuys(vendorid) {
  
  try{
    const { rows } = await client.query(`
    SELECT customer_product_orders.product_name, COUNT(*) AS count, products.id AS productid, customer_product_orders.purchase_total, to_char(DATE(customer_product_orders.product_orderdt)::date, 'MM/DD/YYYY') as dateFormatted, products.*
    FROM customer_product_orders
    RIGHT JOIN products ON customer_product_orders.productid = products.id
    WHERE customer_product_orders.vendorid=$1
    GROUP BY customer_product_orders.product_name, products.id, customer_product_orders.product_orderdt, customer_product_orders.purchase_total
    ORDER BY customer_product_orders.product_orderdt DESC;
 
  `,[vendorid]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get product orders count", error);
  }
  
}

async function getPurchaseItemsTotal(productid){
 try{
    const { rows: [price] } = await client.query(`
    SELECT productid, ROUND(SUM(purchase_total), 2) AS itemsOrderTotal, customer_product_orders.product_name, COUNT(*) AS count, customer_product_orders.prod_img
    FROM customer_product_orders
    WHERE productid=$1
    GROUP BY customer_product_orders.productid, customer_product_orders.product_name, customer_product_orders.prod_img;
  `,[productid]
  ); 
  return price;  
  }catch(error){
   console.error("Could not get product orders total", error);
  }
   
}

async function getRentalItemsTotal(videoid){
 try{
    const { rows: [price] } = await client.query(`
    SELECT videoid, COUNT(*) AS count, videotitle, videothumbnail, ROUND(SUM(videoprice), 2) AS videoOrderTotal
    FROM movierental_orders
    WHERE videoid=$1
    GROUP BY videoid, videotitle, videothumbnail
    ORDER BY videoid ASC;
  `,[videoid]
  ); 
  return price;  
  }catch(error){
   console.error("Could not get product orders total", error);
  }
   
}

async function commentCount(videoid) {
  
  try{
    const { rows } = await client.query(`
    SELECT uploadcomments.videoid, COUNT(*) AS count
    FROM uploadcomments
    WHERE uploadcomments.videoid=$1
    GROUP BY uploadcomments.videoid;
 
  `,[videoid]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get video comments count", error);
  }
  
}

async function filterVideosByDate(channelid, fromdt, thrudt) {
  try {
    const { rows } = await client.query(
      `
    SELECT movierental_orders.videotitle, COUNT(*) AS count, to_char(DATE(movierental_orders.rental_date)::date, 'MM/DD/YYYY') as dateFormatted, useruploads.*
    FROM movierental_orders
    RIGHT JOIN useruploads ON movierental_orders.videoid = useruploads.id
    WHERE movierental_orders.channelid=$1 AND movierental_orders.rental_date BETWEEN '${fromdt}' AND '${thrudt}'
    GROUP BY movierental_orders.videotitle, useruploads.id, movierental_orders.rental_date
    ORDER BY movierental_orders.rental_date DESC;
       `,
      [channelid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function filterOrdersByDate(vendorid, fromdt, thrudt) {
  try {
    const { rows } = await client.query(
      `
    SELECT customer_product_orders.product_name, COUNT(*) AS count, to_char(DATE(customer_product_orders.product_orderdt)::date, 'MM/DD/YYYY') as dateFormatted, products.*
    FROM customer_product_orders
    RIGHT JOIN products ON customer_product_orders.productid = products.id
    WHERE customer_product_orders.vendorid=$1 AND customer_product_orders.product_orderdt BETWEEN '${fromdt}' AND '${thrudt}'
    GROUP BY customer_product_orders.product_name, products.id, customer_product_orders.product_orderdt
    ORDER BY customer_product_orders.product_orderdt DESC;
       `,[vendorid]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}





module.exports = {
  client,
  getRentalsTotals,
  getRentalsTotalsDates,
  getMarketTotals,
  getMarketTotalsDates,
  getChannelSubscribers,
  getTotalChannelLikes,
  getTotalChannelDisLikes,
  getTotalChannelViews,
  getTotalChannelComments,
  getTotalProductOrders,
  getTotalRentalOrders,
  getChannelRentals,
  getMarketBuys,
  commentCount,
  filterVideosByDate,
  filterOrdersByDate,
  getPurchaseItemsTotal,
  getRentalItemsTotal,
};
