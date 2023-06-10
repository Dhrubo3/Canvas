const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-mysql", "root", "123456", {dialect: "mysql", host: "localhost"});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

  const Product = sequelize.define("product", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
  });

  const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
  });

  //// Establishing Relationships ////

  Product.belongsTo(User, {constraints: true, onDelete: "CASCADE"});
  User.hasMany(Product); 

  sequelize
  .sync({force: true})
  .then(result => {
    //console.log(result);
    //app.listen(3000)
  })
  .catch(err => {
    console.log(err);
  })

  //Comment out to avoid creating multiple times
  // Product.create({
  //   title: "Another Book",
  //   price: 4.99,
  //   imageUrl: "Another Book ImageUrl",
  //   description: "Another Awesome Book"
  // }).then(result=>{
  //   //console.log(result);
  // })
  // .catch(err=>{
  //   console.log(err);
  // })

  // Product.findAll()
  // .then(products => {
  //   console.log(products);
  // })
  // .catch(err => {
  //   console.log(err);
  // });

  // Product.findAll({where: {price: 9.99}})
  // .then(products => {
  //   console.log(products[0]);
  // })
  // .catch(err => {
  //   console.log(err);
  // });

  // Product.findByPk(2)
  // .then(product => {
  //   console.log(product);
  // })
  // .catch(err => {
  //   console.log(err);
  // });

  //edit
  // Product.findByPk(5)
  // .then(product => {
  //   product.price= 2.99;
  //   product.save();
  // })
  // .catch(err => {
  //   console.log(err);
  // });

  //delete
  // Product.findByPk(2)
  // .then(product => {
  //   product.destroy();
  // })
  // .catch(err => {
  //   console.log(err);
  // });