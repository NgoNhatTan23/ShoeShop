import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Image, 
  Modal, 
  SafeAreaView 
} from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import CartScreen from './Cart';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfileScreen from './EditProfileScreen';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
  Description: string; // Thêm mô tả cho dịch vụ
};

const CustomerListService = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [favourites, setFavourites] = useState<Service[]>([]);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<{ phone: string; avatarUrl: string }>({ phone: '', avatarUrl: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };
    loadUserData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filteredData = services.filter(service =>
        service.ServiceName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices(filteredData);
    } else {
      setFilteredServices(services);
    }
  };

  const handleCheckout = () => {
    const totalAmount = cart.reduce((total, item) => total + item.Price * (item.Quantity || 1), 0);
    navigation.navigate('CheckoutScreen', {
      cartItems: cart,
      totalAmount,
      onPaymentConfirmed: () => setCart([]),
    });
    setCartVisible(false);
  };

  const handleAddToFavourites = (service: Service) => {
    if (!favourites.some(fav => fav.id === service.id)) {
      setFavourites([...favourites, service]);
      Toast.show({
        text1: 'Đã thêm vào danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'success',
      });
    } else {
      removeFavourite(service.id);
      Toast.show({
        text1: 'Đã xóa khỏi danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'info',
      });
    }
  };

  const removeFavourite = (id: string) => {
    setFavourites(prevFavourites => prevFavourites.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: Service }) => {
    const isFavourite = favourites.some(fav => fav.id === item.id);

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('DetailScreen', { service: item, cart, setCart })}
          activeOpacity={0.7}
        >
          <TouchableOpacity
            style={styles.heartIconContainer}
            onPress={() => handleAddToFavourites(item)}
          >
            <Icon name={isFavourite ? "favorite" : "favorite-border"} size={24} color={isFavourite ? "#ff3d00" : "#ccc"} />
          </TouchableOpacity>
          <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.ServiceName}
            </Text>
            <Text style={styles.itemPrice}>{item.Price} ₫</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const groupedServices = filteredServices.reduce<Service[][]>((acc, service, index) => {
    if (index % 2 === 0) {
      acc.push([service]);
    } else {
      acc[acc.length - 1].push(service);
    }
    return acc;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: userData.avatarUrl || '' }} style={styles.avatar} />
        <Text style={styles.logo}>Bumblebee</Text>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#888"
          />
        </View>
        <Text style={styles.serviceListHeaderText}>Danh sách Sản Phẩm</Text>
        <FlatList
          data={groupedServices}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map(service => renderItem({ item: service }))}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favourite', { favourites, removeFavourite })}>
          <Icon name="favorite" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon name="settings" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
          <Icon name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <CartScreen
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={(itemId: string) => setCart(cart.filter(item => item.id !== itemId))}
        onCheckout={handleCheckout}
      />

      <Toast />

      <Modal visible={isSidebarVisible} transparent={true} animationType="slide">
        <View style={styles.sidebarContainer}>
          <TouchableOpacity onPress={() => setSidebarVisible(false)} style={styles.overlay} />
          <View style={styles.sidebar}>
            <Text style={styles.sidebarHeader}>Menu</Text>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('Home'); }}>
              <Text style={styles.sidebarItem}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('Favourite', { favourites, removeFavourite }); }}>
              <Text style={styles.sidebarItem}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('SettingsScreen'); }}>
              <Text style={styles.sidebarItem}>Cài đặt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('EditProfileScreen'); }}>
              <Text style={styles.sidebarItem}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: '#000',
  },
  searchIcon: {
    padding: 10,
  },
  serviceListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemContainer: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    height: '100%',
  },
  sidebarHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
});

export default CustomerListService;