module.exports = [
    {
        id: "1",
        name: "Pizza Paradise",
        cuisine: "Italian, Pizza",
        rating: 4.5,
        deliveryTime: 30,
        deliveryFee: 0,
        distance: 2,
        price: "₹200-500",
        image: "images/authentic_pizza.png",
        menu: {
            "Pizzas": [
                { id: 101, name: "Margherita", price: 299, description: "Classic tomato and mozzarella", isVeg: true },
                { id: 102, name: "Pepperoni", price: 349, description: "Spicy pepperoni slices", isVeg: false },
                { id: 103, name: "Veggie Supreme", price: 399, description: "Loaded with vegetables", isVeg: true },
                { id: 104, name: "BBQ Chicken", price: 449, description: "Smokey BBQ chicken", isVeg: false }
            ],
            "Sides": [
                { id: 105, name: "Garlic Bread", price: 149, description: "Buttery garlic goodness", isVeg: true },
                { id: 106, name: "Cheesy Fries", price: 199, description: "Fries topped with melted cheese", isVeg: true }
            ],
            "Beverages": [
                { id: 107, name: "Coca Cola", price: 60, description: "Chilled can", isVeg: true },
                { id: 108, name: "Sprite", price: 60, description: "Chilled can", isVeg: true }
            ]
        },
    },
    {
        id: "2",
        name: "Burger Barn",
        cuisine: "American, Burgers",
        rating: 4.3,
        deliveryTime: 25,
        deliveryFee: 0,
        distance: 1.5,
        price: "₹150-400",
        image: "images/juicy_burger.png",
        menu: {
            "Burgers": [
                { id: 201, name: "Classic Burger", price: 199, description: "Juicy beef patty with fresh veggies", isVeg: false },
                { id: 202, name: "Cheese Burger", price: 249, description: "Classic burger with cheddar slice", isVeg: false },
                { id: 203, name: "Double Stack", price: 349, description: "Two patties, double cheese", isVeg: false },
                { id: 204, name: "Chicken Burger", price: 229, description: "Crispy chicken fillet", isVeg: false }
            ],
            "Sides": [
                { id: 205, name: "Fries", price: 129, description: "Salted french fries", isVeg: true },
                { id: 206, name: "Onion Rings", price: 159, description: "Golden fried onion rings", isVeg: true }
            ],
            "Drinks": [
                { id: 207, name: "Milkshake", price: 149, description: "Chocolate or Vanilla", isVeg: true },
                { id: 208, name: "Iced Tea", price: 99, description: "Lemon iced tea", isVeg: true }
            ]
        },
    },
    {
        id: "3",
        name: "Sushi Sensation",
        cuisine: "Japanese, Sushi",
        rating: 4.7,
        deliveryTime: 40,
        deliveryFee: 50,
        distance: 3,
        price: "₹400-800",
        image: "images/fresh_sushi.png",
        menu: {
            "Sushi Rolls": [
                { id: 301, name: "Sushi Roll", price: 499, description: "Fresh salmon and avocado roll", isVeg: false },
                { id: 302, name: "Spicy Tuna", price: 549, description: "Tuna with spicy mayo", isVeg: false },
                { id: 303, name: "California Roll", price: 449, description: "Crab stick, cucumber, avocado", isVeg: false }
            ],
            "All Time Fav": [
                { id: 304, name: "Edamame", price: 199, description: "Steamed soybeans with salt", isVeg: true },
                { id: 305, name: "Gyoza", price: 249, description: "Pan fried dumplings (5pcs)", isVeg: false },
                { id: 306, name: "Miso Soup", price: 149, description: "Traditional Japanese soup", isVeg: true }
            ]
        },
    },
    {
        id: "4",
        name: "Biryani Palace",
        cuisine: "Indian, Biryani",
        rating: 4.6,
        deliveryTime: 35,
        deliveryFee: 20,
        distance: 2.5,
        price: "₹250-500",
        image: "images/authentic_hyderabadi_biryani.png",
        menu: {
            "Biryanis": [
                { id: 401, name: "Biryani", price: 349, description: "Aromatic Hyderabadi Chicken Biryani", isVeg: false },
                { id: 402, name: "Veg Biryani", price: 299, description: "Mixed vegetable biryani", isVeg: true }
            ],
            "Curries": [
                { id: 403, name: "Butter Chicken", price: 399, description: "Creamy tomato curry", isVeg: false },
                { id: 404, name: "Paneer Tikka", price: 349, description: "Paneer cubes in tikka masala", isVeg: true },
                { id: 405, name: "Dal Makhani", price: 299, description: "Black lentils simmered overnight", isVeg: true }
            ],
            "Breads": [
                { id: 406, name: "Naan", price: 40, description: "Butter Naan", isVeg: true },
                { id: 407, name: "Roti", price: 30, description: "Tandoori Roti", isVeg: true }
            ]
        },
    },
    {
        id: "5",
        name: "Dragon Wok",
        cuisine: "Chinese, Asian",
        rating: 4.4,
        deliveryTime: 30,
        deliveryFee: 30,
        distance: 1.8,
        price: "₹200-450",
        image: "images/asian_wok_dishes.png",
        menu: {
            "Noodles & Rice": [
                { id: 501, name: "Pad Thai", price: 299, description: "Thai stir-fried noodles", isVeg: false },
                { id: 502, name: "Fried Rice", price: 249, description: "Veg fried rice", isVeg: true }
            ],
            "Mains": [
                { id: 503, name: "Green Curry", price: 349, description: "Thai green curry with jasmine rice", isVeg: true },
                { id: 505, name: "Spring Rolls", price: 199, description: "Crispy vegetable rolls", isVeg: true }
            ],
            "Soups": [
                { id: 506, name: "Tom Yum Soup", price: 199, description: "Spicy and sour thai soup", isVeg: false }
            ]
        },
    },
    {
        id: "6",
        name: "Sweet Dreams",
        cuisine: "Desserts, Bakery",
        isVeg: true,
        rating: 4.8,
        deliveryTime: 20,
        deliveryFee: 0,
        distance: 1,
        price: "₹100-300",
        image: "images/sweet_bakery_treats.png",
        menu: {
            "Pastries": [
                { id: 601, name: "Chocolate Cake", price: 149, description: "Rich truffle cake slice", isVeg: false },
                { id: 602, name: "Cheesecake", price: 199, description: "New York style cheesecake", isVeg: false },
                { id: 603, name: "Brownies", price: 129, description: "Walnut fudge brownie", isVeg: false }
            ],
            "Bakery": [
                { id: 604, name: "Croissant", price: 99, description: "Butter croissant", isVeg: false },
                { id: 605, name: "Donut", price: 79, description: "Glazed donut", isVeg: false },
                { id: 606, name: "Macarons", price: 249, description: "Box of 3 macarons", isVeg: false }
            ]
        },
    },
    {
        id: "7",
        name: "Taco Fiesta",
        cuisine: "Mexican, Fast Food",
        rating: 4.4,
        deliveryTime: 22,
        deliveryFee: 0,
        distance: 1.2,
        price: "₹150-350",
        image: "images/mexican_tacos.png",
        menu: {
            "Tacos & More": [
                { id: 701, name: "Chicken Tacos", price: 249, description: "Soft shell tacos with grilled chicken", isVeg: false },
                { id: 702, name: "Bean Burrito", price: 199, description: "Loaded bean and cheese burrito", isVeg: true },
                { id: 703, name: "Quesadilla", price: 229, description: "Cheese and veg quesadilla", isVeg: true }
            ],
            "Sides": [
                { id: 704, name: "Loaded Nachos", price: 199, description: "Nachos with salsa and cheese", isVeg: true }
            ]
        },
    },
    {
        id: "8",
        name: "Subway Express",
        cuisine: "Sandwiches, Fast Food",
        rating: 4.5,
        deliveryTime: 18,
        deliveryFee: 0,
        distance: 0.8,
        price: "₹150-300",
        image: "images/fresh_sandwich.png",
        menu: {
            "Sandwiches": [
                { id: 801, name: "Veggie Delite", price: 149, description: "Fresh veggies in sub", isVeg: true },
                { id: 802, name: "Roasted Chicken", price: 199, description: "Oven roasted chicken sub", isVeg: false },
                { id: 803, name: "Tuna Melt", price: 229, description: "Tuna salad with melted cheese", isVeg: false }
            ]
        },
    },
    {
        id: "9",
        name: "Pasta Palace",
        cuisine: "Italian, Pasta",
        rating: 4.6,
        deliveryTime: 35,
        deliveryFee: 20,
        distance: 2.8,
        price: "₹300-600",
        image: "images/creamy_pasta.png",
        menu: {
            "Pasta": [
                { id: 901, name: "Arrabbiata", price: 299, description: "Spicy tomato sauce penne", isVeg: true },
                { id: 902, name: "Alfredo", price: 349, description: "Creamy white sauce pasta", isVeg: true },
                { id: 903, name: "Pesto Chicken", price: 399, description: "Basil pesto with grilled chicken", isVeg: false }
            ],
            "Sides": [
                { id: 904, name: "Bruschetta", price: 199, description: "Toasted bread with tomatoes", isVeg: true },
                { id: 905, name: "Garlic Bread", price: 149, description: "Cheesy garlic bread", isVeg: true }
            ]
        },
    },
    {
        id: "10",
        name: "Salad Station",
        cuisine: "Healthy, Salads",
        isVeg: true,
        rating: 4.7,
        deliveryTime: 20,
        deliveryFee: 0,
        distance: 1.3,
        price: "₹250-450",
        image: "images/healthy_salad.png",
        menu: {
            "Salads": [
                { id: 1001, name: "Caesar Salad", price: 299, description: "Lettuce, croutons, parmesan", isVeg: true },
                { id: 1002, name: "Greek Salad", price: 329, description: "Fresh veggies with feta cheese", isVeg: true },
                { id: 1003, name: "Protein Bowl", price: 399, description: "Quinoa, chickpeas, tofu", isVeg: true }
            ],
            "Smoothies": [
                { id: 1004, name: "Green Detox", price: 199, description: "Spinach, apple, cucumber", isVeg: true },
                { id: 1005, name: "Berry Blast", price: 219, description: "Mixed berries smoothie", isVeg: true }
            ]
        },
    },
    {
        id: "11",
        name: "Tandoori Nights",
        cuisine: "Indian, North Indian",
        rating: 4.6,
        deliveryTime: 35,
        deliveryFee: 40,
        distance: 3.5,
        price: "₹300-700",
        image: "images/tandoori_platter.png",
        menu: {
            "Tandoori Starters": [
                { id: 1101, name: "Tandoori Chicken", price: 399, description: "Spicy roasted chicken", isVeg: false },
                { id: 1102, name: "Paneer Tikka", price: 349, description: "Grilled cottage cheese", isVeg: true },
                { id: 1103, name: "Seekh Kebab", price: 379, description: "Minced lamb skewers", isVeg: false }
            ],
            "Breads": [
                { id: 1104, name: "Naan", price: 40, description: "Butter Naan", isVeg: true },
                { id: 1105, name: "Roti", price: 30, description: "Tandoori Roti", isVeg: true }
            ]
        },
    },
    {
        id: "12",
        name: "Dosa Point",
        cuisine: "South Indian, Dosa",
        isVeg: true,
        rating: 4.4,
        deliveryTime: 25,
        deliveryFee: 20,
        distance: 2.2,
        price: "₹100-300",
        image: "images/crispy_dosa.png",
        menu: {
            "Dosas": [
                { id: 1201, name: "Masala Dosa", price: 120, description: "Spicy potato filling", isVeg: true },
                { id: 1202, name: "Plain Dosa", price: 90, description: "Crispy crepe", isVeg: true },
                { id: 1203, name: "Mysore Masala", price: 140, description: "Red chutney spread", isVeg: true },
                { id: 1204, name: "Rava Dosa", price: 130, description: "Semolina crepe", isVeg: true }
            ],
            "Idlis": [
                { id: 1205, name: "Idli Sambar", price: 80, description: "Steamed rice cakes (2pcs)", isVeg: true },
                { id: 1206, name: "Fried Idli", price: 99, description: "Spiced fried idlis", isVeg: true }
            ]
        },
    },
    {
        id: "13",
        name: "The Breakfast Club",
        cuisine: "Cafe, BreakFast",
        rating: 4.8,
        deliveryTime: 20,
        deliveryFee: 0,
        distance: 1.5,
        price: "₹200-500",
        image: "images/cafe_breakfast.png",
        menu: {
            "Breakfast": [
                { id: 1301, name: "Pancakes", price: 249, description: "Fluffy stack with syrup", isVeg: true },
                { id: 1302, name: "Waffles", price: 299, description: "Belgian waffles with berries", isVeg: true },
                { id: 1303, name: "English Breakfast", price: 499, description: "Eggs, sausages, beans, toast", isVeg: false }
            ],
            "Beverages": [
                { id: 1304, name: "Coffee", price: 120, description: "Brewed coffee", isVeg: true },
                { id: 1305, name: "Fresh Juice", price: 149, description: "Orange juice", isVeg: true }
            ]
        },
    },
    {
        id: "14",
        name: "Frozen Treats",
        cuisine: "Desserts, Ice Cream",
        rating: 4.9,
        deliveryTime: 15,
        deliveryFee: 0,
        distance: 1.0,
        price: "₹100-250",
        image: "images/delicious_dessert.png",
        menu: {
            "Ice Creams": [
                { id: 1401, name: "Vanilla Scoop", price: 99, description: "Classic vanilla", isVeg: true },
                { id: 1402, name: "Chocolate Fudge", price: 149, description: "Rich chocolate w/ nuts", isVeg: true },
                { id: 1403, name: "Strawberry Swirl", price: 129, description: "Berry flavored", isVeg: true }
            ],
            "Sundaes": [
                { id: 1404, name: "Hot Fudge Sundae", price: 199, description: "Ice cream with hot fudge", isVeg: true },
                { id: 1405, name: "Banana Split", price: 249, description: "Classic split", isVeg: true }
            ]
        },
    },
    {
        id: "15",
        name: "Juice Junction",
        cuisine: "Healthy, Juices",
        isVeg: true,
        rating: 4.5,
        deliveryTime: 15,
        deliveryFee: 0,
        distance: 1.2,
        price: "₹150-300",
        image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=1000",
        menu: {
            "Juices": [
                { id: 1501, name: "Orange Juice", price: 149, description: "Freshly squeezed", isVeg: true },
                { id: 1502, name: "Watermelon Juice", price: 129, description: "Cool and refreshing", isVeg: true },
                { id: 1503, name: "Mixed Fruit", price: 169, description: "Healthy mix", isVeg: true }
            ],
            "Shakes": [
                { id: 1504, name: "Protein Shake", price: 199, description: "Whey protein shake", isVeg: true },
                { id: 1505, name: "Mango Lassi", price: 149, description: "Yogurt drink", isVeg: true }
            ]
        },
    },
    {
        id: "16",
        name: "BBQ Nation",
        cuisine: "American, BBQ",
        rating: 4.7,
        deliveryTime: 45,
        deliveryFee: 50,
        distance: 4.5,
        price: "₹500-1000",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000",
        menu: {
            "Grills": [
                { id: 1601, name: "BBQ Chicken Wings", price: 399, description: "Smoky glazed wings", isVeg: false },
                { id: 1602, name: "Grilled Prawns", price: 499, description: "Spicy grilled prawns", isVeg: false },
                { id: 1603, name: "BBQ Ribs", price: 599, description: "Tender pork ribs", isVeg: false }
            ],
            "Sides": [
                { id: 1604, name: "Corn on Cob", price: 149, description: "Buttered corn", isVeg: true },
                { id: 1605, name: "Coleslaw", price: 99, description: "Creamy salad", isVeg: true }
            ]
        },
    },
    {
        id: "17",
        name: "The Green Bowl",
        cuisine: "Vegan, Healthy",
        isVeg: true,
        rating: 4.6,
        deliveryTime: 25,
        deliveryFee: 20,
        distance: 2.0,
        price: "₹300-600",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
        menu: {
            "Bowls": [
                { id: 1701, name: "Buddha Bowl", price: 349, description: "Healthy grain bowl", isVeg: true },
                { id: 1702, name: "Burrito Bowl", price: 399, description: "Mexican rice bowl", isVeg: true },
                { id: 1703, name: "Teriyaki Tofu", price: 379, description: "Asian style tofu bowl", isVeg: true }
            ]
        },
    },
    {
        id: "18",
        name: "Ocean Catch",
        cuisine: "Seafood, Fast Food",
        rating: 4.3,
        deliveryTime: 35,
        deliveryFee: 30,
        distance: 3.2,
        price: "₹400-800",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80",
        menu: {
            "Seafood": [
                { id: 1801, name: "Fish & Chips", price: 399, description: "Classic batter fried fish", isVeg: false },
                { id: 1802, name: "Grilled Salmon", price: 599, description: "Lemon butter sauce", isVeg: false },
                { id: 1803, name: "Prawn Curry", price: 449, description: "Coconut based curry", isVeg: false }
            ],
            "Starters": [
                { id: 1804, name: "Calamari Rings", price: 299, description: "Fried squid rings", isVeg: false }
            ]
        },
    },
    // Essential Stores (InstaMart)
    {
        id: "101",
        name: "Fresh Farm Produce",
        cuisine: "Fruits & Veggies",
        rating: 4.8,
        deliveryTime: 15,
        deliveryFee: 0,
        distance: 1.2,
        price: "Min ₹100",
        image: "images/healthy_salad.png",
        menu: {
            "Fresh Vegetables": [
                { id: 1001, name: "Potatoes", price: 40, description: "Fresh farm potatoes (1kg)" },
                { id: 1002, name: "Onions", price: 35, description: "Red onions (1kg)" },
                { id: 1003, name: "Tomatoes", price: 30, description: "Ripe red tomatoes (1kg)" },
                { id: 1004, name: "Spinach", price: 25, description: "Fresh spinach bunch" },
                { id: 1005, name: "Carrots", price: 45, description: "Orange carrots (1kg)" }
            ],
            "Fresh Fruits": [
                { id: 1006, name: "Apples", price: 120, description: "Shimla Apples (1kg)" },
                { id: 1007, name: "Bananas", price: 60, description: "Robusta Bananas (1 Dozen)" },
                { id: 1008, name: "Mangoes", price: 150, description: "Alphonso Mangoes (1kg)" }
            ]
        }
    },
    {
        id: "102",
        name: "Daily Needs Dairy",
        cuisine: "Dairy & Bakery",
        rating: 4.5,
        deliveryTime: 20,
        deliveryFee: 15,
        distance: 2.5,
        price: "Min ₹150",
        image: "images/sweet_bakery_treats.png",
        menu: {
            "Dairy": [
                { id: 2001, name: "Milk", price: 50, description: "Full Cream Milk (1L)" },
                { id: 2002, name: "Butter", price: 55, description: "Salted Butter (100g)" },
                { id: 2003, name: "Cheese Slices", price: 120, description: "Processed Cheese (10 slices)" },
                { id: 2004, name: "Curd", price: 30, description: "Fresh Curd (400g)" }
            ],
            "Bakery": [
                { id: 2005, name: "Whole Wheat Bread", price: 45, description: "Freshly baked bread" },
                { id: 2006, name: "Buns", price: 30, description: "Burger Buns (4pcs)" },
                { id: 2007, name: "Rusk", price: 40, description: "Crunchy Rusk (200g)" }
            ]
        }
    },
    {
        id: "103",
        name: "Snack Station",
        cuisine: "Snacks & Munchies",
        rating: 4.6,
        deliveryTime: 25,
        deliveryFee: 20,
        distance: 3.0,
        price: "Min ₹100",
        image: "images/spicy_snacks.png",
        menu: {
            "Chips & Crisps": [
                { id: 3001, name: "Potato Chips", price: 20, description: "Classic Salted" },
                { id: 3002, name: "Nachos", price: 50, description: "Cheese Nachos" }
            ],
            "Biscuits": [
                { id: 3003, name: "Chocolate Cookies", price: 30, description: "Rich chocolate chips" },
                { id: 3004, name: "Digestive Biscuits", price: 45, description: "Healthy digestive biscuits" }
            ]
        }
    }
];
