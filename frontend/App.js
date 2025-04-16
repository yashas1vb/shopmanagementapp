import React, { useState, useEffect } from 'react';
import { View, Pressable, TouchableOpacity, Text, TextInput, Button, StyleSheet, FlatList, Alert, Image, Dimensions } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { Linking } from 'react-native';
import * as SMS from 'expo-sms';


// Create a Stack Navigator
const Stack = createStackNavigator();

const { width: viewportWidth } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const slides = [
    {
      title: "Welcome",
      description: "Welcome to the Shop Management App!",
      image: require('./assets/welcome.png'),
    },

    {
      title: "Product Inventory",
      description: "Manage your product inventory seamlessly.",
      image: require('./assets/inventory.png'),
    },

    {
      title: "Log Sale",
      description: "Easily log sales and track your performance.",
      image: require('./assets/log_sale.png'),
    },

    {
      title: "Payment Reminder",
      description: "Send payment reminders to your customers.",
      image: require('./assets/payment_reminder.png'),
    },
  ];
  const renderItem = ({ item }) => {
    // console.log('Rendering item:',item);
    if(!item){
      console.error('Item is undefined');
      return null;
    }
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };
  // console.log('Slides:',slides);
  return (
    <View style={styles.onboardingContainer}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      <Pressable
        style={styles.customButton}
        onPress={() => navigation.replace('Dashboard')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
};

// Dashboard Screen
function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>StoreMate</Text>
          <Text style={styles.description}>Your shop buddy!</Text>
        </View>
        <Image 
          source={require('./assets/main.png')} // Replace with your image path
          style={styles.headerImage} 
          resizeMode="contain" 
        />
      </View>
      {/* Main Content */}
      <View style={styles.boxContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ProductManagement')}>
            <View style={styles.imageContainer}>
              <Image 
                source={require('./assets/inventory.png')} 
                style={styles.image} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.boxText}>Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('SalesManagement')}>
            <View style={styles.imageContainer}>
              <Image 
                source={require('./assets/log_sale.png')} 
                style={styles.image} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.boxText}>Log Sales</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Payments')}>
            <View style={styles.imageContainer}>
              <Image 
                source={require('./assets/payment_reminder.png')} 
                style={styles.image} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.boxText}>Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Product Management Screen
export function ProductManagementScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');

  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(productName)) {
      Alert.alert('Invalid Name', 'Product name should only contain letters.');
      return false;
    }

    if (isNaN(productPrice) || productPrice <= 0) {
      Alert.alert('Invalid Price', 'Product price should be a valid positive number.');
      return false;
    }

    if (isNaN(productStock) || productStock <= 0) {
      Alert.alert('Invalid Stock', 'Product stock should be a valid positive number.');
      return false;
    }

    return true;
  };

  const addProduct = async () => {
    if (!validateInputs()) return;

    try {
      await axios.post('http://192.168.1.6:5000/products', {
        product_name: productName,
        product_price: productPrice,
        product_stock: productStock,
      });
      Alert.alert('Product Added Successfully!');
      setProductName('');
      setProductPrice('');
      setProductStock('');
    } catch (error) {
      Alert.alert('Error adding product');
    }
  };

  return (
    <View style={styles.productcontainer}>
      <View style={styles.productheader}>
        <Text style={styles.productheaderText}>Manage Products</Text>
      </View>
      <View style={styles.productformContainer}>
        <TextInput
          style={styles.productinput}
          placeholder="Product Name"
          value={productName}
          onChangeText={setProductName}
        />
        <TextInput
          style={styles.productinput}
          placeholder="Product Price"
          keyboardType="numeric"
          value={productPrice}
          onChangeText={setProductPrice}
        />
        <TextInput
          style={styles.productinput}
          placeholder="Product Stock"
          keyboardType="numeric"
          value={productStock}
          onChangeText={setProductStock}
        />
        <TouchableOpacity style={styles.productaddButton} onPress={addProduct}>
          <Text style={styles.productaddButtonText}>Add New Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.productviewButton}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.productviewButtonText}>View Inventory</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SalesHistoryScreen() {
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        const response = await axios.get('http://192.168.1.6:5000/sales_history');
        // console.log('Fetched Sales History:', response.data.data);
        setSalesHistory(response.data.data);
      } catch (error) {
        console.error('Error fetching sales history:', error);
        Alert.alert('Error', 'Could not load sales history.');
      }
    };
    fetchSalesHistory();
  }, []);

  return (
    <View style={styles.histcontainer}>
      <Text style={styles.histheader}>Sales History</Text>
      <FlatList
        data={salesHistory}
        keyExtractor={(item, index) => 
          item.sale_history_id ? `${item.sale_history_id}` : `${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.histitem}>
            <Text>Product ID: {item.product_id || 'N/A'}</Text>
            <Text>Quantity Sold: {item.sale_quantity || 0}</Text>
            <Text>Date: {item.sale_date ? new Date(item.sale_date).toLocaleDateString() : 'N/A'}</Text>
            <Text>Customer: {item.customer_name || 'N/A'}</Text>
            <Text>Phone: {item.customer_phone || 'N/A'}</Text>
            <Text>Total Price: {item.total_amount !== null && item.total_amount !== undefined ? item.total_amount : 0}</Text>
            <Text>Payment Status: {item.payment_status || 'Unknown'}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );  
}




// Sales Management Screen
export function SalesManagementScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Due');
  const [productPrice, setProductPrice] = useState(0);
  const [stockAvailable, setStockAvailable] = useState(0); // State to track available stock for selected product

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.1.6:5000/products');
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Could not load products.');
      }
    };
    fetchProducts();
  }, []);

  // Handle product change to update product price and stock
  const handleProductChange = (itemValue) => {
    setProductId(itemValue);
    const selectedProduct = products.find(product => product.product_id === itemValue);
    setProductPrice(selectedProduct ? selectedProduct.product_price : 0);
    setStockAvailable(selectedProduct ? selectedProduct.product_stock : 0); // Set stock available for selected product
  };

  // Phone number validation (simple regex for 10 digit number)
  const isValidPhoneNumber = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  // Handle logging of sale with additional validation checks
  const handleLogSale = async () => {
    if (!productId || !saleQuantity || !customerName || !customerPhone || !paymentStatus) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(saleQuantity) || parseInt(saleQuantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (parseInt(saleQuantity) > stockAvailable) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    if (!isValidPhoneNumber(customerPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (customerName.trim() === '') {
      Alert.alert('Error', 'Please enter a valid customer name');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.6:5000/sales', {
        product_id: productId,
        sale_quantity: parseInt(saleQuantity),
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_status: paymentStatus,
      } ,{ timeout: 5000 });

      if (response.status === 200) {
        Alert.alert('Success', response.data.message);
        setProductId('');
        setSaleQuantity('');
        setCustomerName('');
        setCustomerPhone('');
        setPaymentStatus('Due');
        setProductPrice(0);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        Alert.alert('Error', error.response.data.message); // Show backend error message
      } else {
        Alert.alert('Error', 'Failed to log the sale.');
      }
      console.error('Error logging sale:', error);
    }
  };

  return (
    <View style={styles.logcontainer}>
      <View style={styles.logheader}>
        <Text style={styles.logheaderText}>Log Sale</Text>
      </View>
  
      <View style={styles.logformContainer}>
        <Picker
          selectedValue={productId}
          style={styles.picker}
          onValueChange={handleProductChange}
        >
          <Picker.Item label="Select Product" value="" />
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <Picker.Item
                key={product.product_id}
                label={product.product_name}
                value={product.product_id}
                style={styles.pickerItem}
              />
            ))
          ) : (
            <Picker.Item label="No products available" value="" />
          )}
        </Picker>
  
        <TextInput
          style={styles.loginput}
          placeholder="Sale Quantity"
          keyboardType="numeric"
          value={saleQuantity}
          onChangeText={setSaleQuantity}
        />
        <TextInput
          style={styles.loginput}
          placeholder="Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <TextInput
          style={styles.loginput}
          placeholder="Customer Phone"
          keyboardType="phone-pad"
          value={customerPhone}
          onChangeText={setCustomerPhone}
        />
  
        <Picker
          selectedValue={paymentStatus}
          style={styles.picker}
          onValueChange={(itemValue) => setPaymentStatus(itemValue)}
        >
          <Picker.Item label="Due" value="Due" />
          <Picker.Item label="Paid" value="Paid" />
        </Picker>
  
        <TouchableOpacity style={styles.logSaleButton} onPress={handleLogSale}>
          <Text style={styles.logSaleButtonText}>Log Sale</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.salesHistoryButton} onPress={() => navigation.navigate('SalesHistory')}>
          <Text style={styles.salesHistoryButtonText}>Sales History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  
}




//Customer payment screen
export  function PaymentScreen({ navigation }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dueAmount, setDueAmount] = useState('');

  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const dueAmountRegex = /^[0-9]+(\.[0-9]{1,2})?$/;

    if (!nameRegex.test(customerName)) {
      Alert.alert('Error', 'Customer name should contain only alphabets.');
      return false;
    }
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Phone number should be exactly 10 digits.');
      return false;
    }
    if (!dueAmountRegex.test(dueAmount)) {
      Alert.alert('Error', 'Due amount should be a valid number.');
      return false;
    }
    return true;
  };

  const sendReminder = () => {
    if (!validateInputs()) return;
    const message = `Dear ${customerName}, this is a reminder that your payment of Rs.${dueAmount} is pending. Please pay at your earliest convenience. Thank you!`;
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    Linking.openURL(smsUrl)
      .then(() => {
        setCustomerName('');
        setPhoneNumber('');
        setDueAmount('');
      })
      .catch(() => Alert.alert('Error', 'Unable to open SMS app'));
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    try {
      const response = await axios.post('http://192.168.1.6:5000/payments', {
        customer_name: customerName,
        customer_phone: phoneNumber,
        due_amount: dueAmount,
      });

      if (response.status === 200) {
        Alert.alert('Payment Saved', 'Payment details have been saved successfully.');
        setCustomerName('');
        setPhoneNumber('');
        setDueAmount('');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save payment details');
    }
  };

  return (
    <View style={styles.ccontainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Customer Payments</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Due Amount"
          keyboardType="numeric"
          value={dueAmount}
          onChangeText={setDueAmount}
        />

        {/* Save Payment Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Save Payment Details</Text>
        </TouchableOpacity>

        {/* Send Reminder Button */}
        <TouchableOpacity style={styles.secondaryButton} onPress={sendReminder}>
          <Text style={styles.secondaryButtonText}>Send Payment Reminder</Text>
        </TouchableOpacity>

        {/* View Pending Payment Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PendingPayments')}
        >
          <Text style={styles.primaryButtonText}>View Pending Payments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function PendingPaymentsScreen() {
  const [pendingPayments, setPendingPayments] = useState([]);

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:5000/payments');
      setPendingPayments(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load pending payments.');
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const deletePayment = async (paymentId) => {
    try {
      await axios.delete(`http://192.168.1.6:5000/payments/${paymentId}`);
      Alert.alert('Success', 'Payment record deleted successfully.');
      setPendingPayments((prev) => prev.filter((payment) => payment.payment_id !== paymentId));
    } catch {
      Alert.alert('Error', 'Could not delete payment record.');
    }
  };

  const sendReminder = async (phoneNumber, customerName, dueAmount) => {
    const message = `Dear ${customerName}, this is a reminder that your payment of Rs.${dueAmount} is pending. Please pay at your earliest convenience.`;

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      try {
        await SMS.sendSMSAsync([phoneNumber], message);
        Alert.alert('Reminder Sent', 'Reminder has been sent successfully.');
      } catch {
        Alert.alert('Error', 'An error occurred while sending the reminder.');
      }
    } else {
      Alert.alert('Error', 'SMS functionality is not available on this device.');
    }
  };

  return (
    <View style={styles.pendingcontainer}>
      <View style={styles.pendingheader}>
        <Text style={styles.pendingheaderText}>Pending Payments</Text>
      </View>
      <FlatList
        data={pendingPayments}
        keyExtractor={(item) => item.payment_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pendingitem}>
            <Text>Name: {item.customer_name}</Text>
            <Text>Phone: {item.customer_phone}</Text>
            <Text>Due Amount: {item.due_amount}</Text>
            <View style={styles.pendingbuttonContainer}>
              <TouchableOpacity
                style={styles.pendingdeleteButton}
                onPress={() =>
                  Alert.alert('Confirm Delete', `Delete ${item.customer_name}'s record?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', onPress: () => deletePayment(item.payment_id) },
                  ])
                }
              >
                <Text style={styles.pendingdeleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pendingsendButton}
                onPress={() => sendReminder(item.customer_phone, item.customer_name, item.due_amount)}
              >
                <Text style={styles.pendingsendButtonText}>Send Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// Inventory Screen
export function InventoryScreen() {
  const [products, setProducts] = useState([]);
  const [newStock, setNewStock] = useState({}); // Store new stock values for each product
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products list

  // Fetch all products when the screen loads
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products whenever searchQuery or products change
    filterProducts();
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:5000/products');
      if (response.data.data && response.data.data.length > 0) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data); // Initialize filtered products
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    }
  };

  // Function to update the stock of a product
  const updateProductStock = async (productId) => {
    const stock = newStock[productId]; // Get the new stock value for this product

    if (stock === undefined || isNaN(stock)) {
      Alert.alert('Invalid Input', 'Please enter a valid stock value.');
      return;
    }

    try {
      await axios.put(`http://192.168.1.6:5000/products/${productId}`, {
        product_stock: stock,
      });

      Alert.alert(
        'Stock Updated',
        stock <= 0 ? 'Stock has reached zero!' : 'Stock updated successfully.'
      );

      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error('Error updating product stock:', error);
      Alert.alert('Error updating stock');
    }
  };

  // Function to confirm and delete a product
  const confirmDelete = (productId, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(productId),
        },
      ],
      { cancelable: true }
    );
  };

  // Function to delete the product
  const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`http://192.168.1.6:5000/products/${productId}`);
      
      if (response.status === 200) {
        Alert.alert('Success', response.data.message || 'Product deleted successfully');
        fetchProducts(); // Refresh product list after deletion
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Error deleting product');
    }
  };

  // Function to filter products based on search query
  const filterProducts = () => {
    if (!searchQuery) {
      setFilteredProducts(products); // Show all products if no search query
    } else {
      const filtered = products.filter((product) =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <View style={styles.inventorycontainer}>
      <View style={styles.inventoryheader}>
        <Text style={styles.inventoryheaderText}>Inventory</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.inventorysearchBar}
        placeholder="Search by product name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredProducts.length === 0 ? (
        <Text style={styles.noProductsText}>No products found.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.inventoryitemContainer}>
              <Text style={styles.inventoryitemText}>Name: {item.product_name}</Text>
              <Text style={styles.inventoryitemText}>Price: ₹{item.product_price}</Text>
              <Text style={styles.inventoryitemText}>Stock: {item.product_stock}</Text>

              <TextInput
                style={styles.inventoryinput}
                placeholder="Enter New Stock"
                keyboardType="numeric"
                onChangeText={(value) =>
                  setNewStock((prev) => ({ ...prev, [item.product_id]: parseInt(value) }))
                }
              />
              <View style={styles.inventorybuttonContainer}>
                <TouchableOpacity
                  style={styles.inventoryupdateButton}
                  onPress={() => updateProductStock(item.product_id)}
                >
                  <Text style={styles.inventoryupdateButtonText}>Update Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inventorydeleteButton}
                  onPress={() => confirmDelete(item.product_id, item.product_name)}
                >
                  <Text style={styles.inventorydeleteButtonText}>Delete Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}


// App component with Navigation setup
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{headerShown: false}} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{headerShown: false}}/>
        <Stack.Screen name="ProductManagement" component={ProductManagementScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SalesManagement" component={SalesManagementScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SalesHistory" component={SalesHistoryScreen}  options={{headerShown: false}}/>
        <Stack.Screen name="Payments" component={PaymentScreen} options={{headerShown: false}}/>
        <Stack.Screen name="PendingPayments" component={PendingPaymentsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Inventory" component={InventoryScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D62',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },

  textContainer: {
    flex: 1,
    marginRight: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  description: {
    fontSize: 16,
    color: '#fff',
  },

  headerImage: {
    width: 140, // Adjust size as needed
    height: 140, // Adjust size as needed
    // marginLeft: 10,
  },

  boxContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: '45%', // Adjust width to fit two boxes side by side
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 5, // Add some horizontal margin between boxes
    padding: 10,
  },

  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  image: {
    width: 20,
    height: 20,
  },

  boxText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#002D62',

  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: viewportWidth,

  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'white',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    color:'white',
  },
  customButton:{
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal:20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 100,
  },
  buttonText: {
    color: '#002D62', // Button text color
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
    //Customer payments
  ccontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: 80,
    backgroundColor: '#002D62',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#d4e6fb',
    borderRadius: 15,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#002D62',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  primaryButton: {
    backgroundColor: '#002D62',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#002D62',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  secondaryButtonText: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: 'bold',
  },
  //Pending paymentScreen
  pendingcontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  pendingheader: {
    backgroundColor: '#002D62',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingheaderText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pendingitem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  pendingbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pendingdeleteButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#002D62',
  },
  pendingdeleteButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
  },
  pendingsendButton: {
    backgroundColor: '#002D62',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  pendingsendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  //Product
  productcontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  productheader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#002D62',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productheaderText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  productformContainer: {
    backgroundColor: '#e6f0ff',
    padding: 20,
    borderRadius: 15,
    width: '90%', // Responsive width
    maxWidth: 400, // Maximum width for larger screens
    elevation: 3,
    alignItems: 'center',
  },
  productinput: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  productaddButton: {
    backgroundColor: '#002D62',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  productaddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productviewButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  productviewButtonText: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: 'bold',
  },
  //Inventory
  inventorycontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  inventoryheader: {
    backgroundColor: '#002D62',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryheaderText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  inventorysearchBar: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inventorynoProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  inventoryitemContainer: {
    backgroundColor: '#e6f0ff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  inventoryitemText: {
    fontSize: 16,
    marginVertical: 2,
    color: '#333',
  },
  inventoryinput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  inventorybuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inventoryupdateButton: {
    backgroundColor: '#002D62',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  inventoryupdateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inventorydeleteButton: {
    backgroundColor: 'white',
    borderColor: '#002D62',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  inventorydeleteButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
  },
  //Log sales
  logcontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Overall light background
  },
  logheader: {
    backgroundColor: '#002D62',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  logheaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logformContainer: {
    flex: 1,
    justifyContent: 'center', // Center form container vertically
    alignItems: 'center', // Center form container horizontally
    paddingTop: 100, // Ensure it's below the sticky header
    paddingHorizontal: 20,
    backgroundColor: '#E0F7FA', // Light blue background for form container
    borderRadius: 10,
  },
  loginput: {
    width: '90%', // Increase width of input fields
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  picker: {
    width: '90%', // Increased width for the picker
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  logSaleButton: {
    width: '90%', // Same width as input fields and picker
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderColor: '#002D62',
    borderWidth: 1,
    alignItems: 'center',
  },
  logSaleButtonText: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: 'bold',
  },
  salesHistoryButton: {
    width: '90%', // Same width as other components
    backgroundColor: '#002D62',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  salesHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  //Sales history
  histcontainer: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Light background similar to Inventory
    paddingHorizontal: 10,
    paddingTop: 80, // Space for sticky header
  },
  histheader: {
    backgroundColor: '#002D62',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1000,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  histitem: {
    backgroundColor: '#e6f0ff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
});
