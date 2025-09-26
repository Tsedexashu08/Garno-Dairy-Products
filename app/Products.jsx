import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getEthiopianDateWithAmharic } from './EthiopianDate';

const { width } = Dimensions.get('window');

// Mock dairy products data
const dairyProducts = [
    {
        id: '1',
        name: 'Fresh Organic Milk',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300',
        category: 'milk',
        description: 'Farm-fresh organic whole milk',
        unit: 'L',
        measurement: 'volume',
        popular: true,
        step: 0.5,
        min: 0.5
    },
    {
        id: '2',
        name: 'Greek Yogurt',
        price: 3.49,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
        category: 'yogurt',
        description: 'Creamy protein-rich yogurt',
        unit: 'g',
        measurement: 'weight',
        popular: true,
        step: 100,
        min: 100
    },
    {
        id: '3',
        name: 'Aged Cheddar Cheese',
        price: 8.99,
        image: 'data:image/jpeg;base64,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',
        category: 'cheese',
        description: '12-month aged sharp cheddar',
        unit: 'g',
        measurement: 'weight',
        step: 50,
        min: 50
    },
    {
        id: '4',
        name: 'French Butter',
        price: 6.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzkU2abSltM1TyVpXz0ojyiDnGg9C04eZT5w&s',
        category: 'butter',
        description: 'Premium European-style butter',
        unit: 'g',
        measurement: 'weight',
        step: 25,
        min: 25
    },
    {
        id: '5',
        name: 'Vanilla Ice Cream',
        price: 5.99,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMVFhUXFxUXFxUYFRcXFRYXFRcXFhUXFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGi0dHx0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0rLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAD8QAAECAgcFBwIEBAUFAAAAAAEAAgMRBBIhMUFRYQVxgZGhBhMiMrHB8FLRQmLh8RQVcoIjM0OSogdTssLi/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAEDAgQF/8QAJBEBAQACAgICAgIDAAAAAAAAAAECEQMxEiEiQRNRMmEEQnH/2gAMAwEAAhEDEQA/ADhqeqFINTgLz3oo1E4AUpJSQNISS4IklEhA0QQyEWqkWoCATolVNJAQSKlVSLUwhNNMqbIRJkASTcBaVB7S2w2aJ6G0XJ2tUSpNKRpVUpJAp5IJGSUlJJAQLFB7EUqKAZrUzgntSLkEAWpFqnEtUBNBkovKTioOQEZpJJJG1ZJAKJanAQEgkoqAQBZ6pKASmgJTSmopigJ1kg5RapSQZppTTyV7ZOzjGeG4C1xTktuozlZJutXstQJTjPsBBDedp6S5q7tbYbY7ZsIDxORz0K3KPRhVqSEgJSwACoRaHFhGcM1m/Sb+C7ZjJjrt59zty8unnVJguhuLXiRF4UAV2e2YUKkCR8EQZ2EfcLjqXRnQ3FrhxXPycevc6dXHyzLvtNimqrHIocpLiBIFRBSSCRUVFyYBIJpWKBCUkwcyUCnIUHJkg4piUOLSGC9w5qtG2mxuf/iOZWpjazc8YuTSWT/PYen+9qZP8dZ/Ji6mSVVFsTKaoYYoo81AQ0BDmkOKJVSkgw0uCnJOgIcErclOxMEAzWr0Ds7s0MhCYtImeK5bYFAMSI0y8IImesl6Gxsgungx+3H/AJOf+sMGyTOCJJDfuXQ5GVtXZbIlpFoxF65zaWw3fhNYSuN4+67GsLZqtFhytSslalseaUjZrmi4zyPsqdZel0mAHSsWNtfYDXs8Njxcc9Co5cP6dGHPr1XHtenL1n7WdGo58cObbq2BO8XKpB21P/TPAzULhXROTFuVilNAojy8TlVGt53AKyGyTnFlSvLjA3u1QKVTAwTcQ0Zn7KrTNouc7u4LWucPMf8ATYfzOxP5QgQ9itJrxiYr/wA1jRuYMN61ccce/bPlnl16Uo+3y8ygh7yMhZ9woijUuJe0MGbnW8guhYwASaA0ZCwdE9bVZvJ+j/H+6xIfZ9588d25gDev6KxC2BAFpbWObiT+i0SSkUvK1qYSKv8AK4P/AGof+0JKxNJZ3T02Jppp57kvlyShJTTjimPFMjTSmpCE43AqTaI7IBamFv0zc8Z9hEppq0KFr0UxQxqtfiyY/Niol2qQcrb6HvHJVYkBw19eSV48oc5sa7XsZEaYRA8wca2dspH5kuma5eT7P2i6E+uw2jkdCF2uzO00KJIONR2RuJ0K6eLOWa+3JzceUvlPcdMgxDIobXVhNpBGc1GNWvVdIbNEQohskhxXuyVd1KzBSMWriq8R2CKY4QYrwgK9IoTHtk5oNtxFnFchT+yADnGFZb5QBvkMl1rotUTnvQf4wTsvKLjs5bHEshVJh3hleXGUgMZnBZtKpRjeFhLYWL7nRNGfS3W8rZ7cCFEislIuaCHb75FYjSubk5NXUdfFx7nlRqMxrQGtAAFwCOHhVQ5PXXO6Ry5NXQQ9OHIAtaag56YOSJTZKsmTT3JIDoC/VFgwHOuuzwT7OoVebj5B1P0hX6ZSWQmFzpBrcB0ACrhx791Pl5fH1OwG0AC8k9FYh0TJvFZWz9qOiunc3AfcrdbHsV8cZ9ObLPK9otoeZRW0ZgvmUF8YoD3nNbYaIMMYBSbTWj9lklOEbPTooFOhuscGneFQ2vshtUvh4Xt9wswFbOyaZPwlPsunG06jnzN8w/5D7rPZGnbNdbtuh92+zym0e4XJbRhVHzHld0OPNc/Lh9ujhz+qsDbMWE2s17xL6TMgZyx3Kbu3lKg+J0orCAQ5vvpLFZnfYoG0aUwEOhsABAESFPwl2MSH9BOLbp77Fx8l1rZ83F73I6uhf9S4b7HMI3yHuVrwO1MN+g4H0Xlztnw4lsIkHFsrRvCrihRAZeir+TJDwj0+P2uo4JBmCMJGZWfSO2EORqglcVA2XEN5lvTR6DGZex0swCR0WMuTOdKY8eF7b8ftM51kjV32+izX7TeSPEfTqsmunERRy5Mr3V8cMceo0RFUw9UmPR2uU1VgFOgtepVkAQmSVdCL01ZILNdKsq7HqRetMjJKvWCSA9L7mpCht/KHHe61cb24imTG4TJ4iUvVdzTz4IZzht9AuG7aMmxjsnEcx+i7LPi4u8i7MmbQuohrkOysSwhdfDKMeip3IZRHoS0RimCcpkGdSgRC1wKimQTd2hC72DMXttHuuL2jR6zCMbxvC7PY0WbZFc7tODUiObkTywRkMa4OLGkqFIjrQ7QwC2IZXG3n8Kxy1cVmq7sctwOHS3MdOqHaEkEagi4q/C7TRAJOZPfIkcbClQ9kOiCdzfqOP9Ix9Fch0CCy8Vjrb0Fg/wCSpjlU8scdpQe1sU2Mo7Sc/ETyCt0HatLiOkRCE8DWs3hhLkeFSpsIEJlXKq6XG0N6IP8AERXWCxv5QABvP3VN/wBp+P8AS7SaBDI/xHNr5w6xaP8AeJobqDQwLO/ccZvY1vDwkqiN890z+iRBODz/AGj7pWy/RyWfYsSjUcnw94ze5rx0AVuF2biPaXQHsiyEy0GTwMy02y1WYIecxvafaa2NnwokICK0hzR+JptaeFoKeOEy7gudnVYcZjmGq5pBGBEioVyulp9MZSh4rIg/ELC7/wCvXG21czSGFjpHgcxmFHPj8eulcOTy/wCnrJFyDWSmpqC1k5egzS7xMC94EkHvE6C29hj+KjwXflA5CXsuU7RwK0F+Yk7lf0muq2Ka9EczFhPI+Ie/JY9KYCCDcQQeK7J7xjiymsq4fs7HqxJZruqO6YXnUVpgxiPpPTDou12ZSw5oSxFaxQikIiU1oiIUZJyUxKAcJFQc9BNJGFu5Mmxsh8is7a8WvFcRn6WJNpBlIWKtGeGgkpWiRynawituA9VlbGogiRJHyi12oGHFWO0EUkzxcZ8BYPVWezbJNcc5jkAR0DlzX5ZOqbxwWqa9zrBINuss4AZDJBomzYjz4Wk/Pl8l0eztmNsc/llp9yttjA0eESC3Md32xc9dMGhdmIhtc5rdwBPM/dbULs3D/GS4ZGwcgrsGkWIrY1irNRG208HZEAXQ28leg0SGLmjkqYjIsGkW2rcyYsHpOxIEUeJjTrK3muR7Q9nYkAGLCM2iQle6RskfqGhXbMiyxRHScJETBvGC1vfZTceJxbTWFh0uVp9WPDIdIRG2gnPXQ488DPe7Y9ne7PeQ/KfMJeU5yyXLQXGsDc4YqVmrqrS+U3GL/EgOLHTY4GRa7A70eWOHRdBt3s62kUY0iGP8WFIRGi8swc3OXpLJcls6K+GbDMZXHkVLLjimPLV0Jk9LpjXESbVOMruSGo2aq+N3EklDgkkb1zsrSasUsN0QS4i0e44om1qNVcRyWJDiFpBFhBBBliLQu0hltKhB1zsRkceC6OHL1pD/ACMNXyea9otkl/jYPELCMx91lbNpzoZqunYu/p+z3sNoszWRHojHeZoO8KtxQ2BA2m0i9WP5k3NCZs+GPwDkrLIIFwluCAH/ABrj5WOPCQ5lSBiHJvUqwyA44I7aIcSgKLaOPxEnfdyVhsPII7gxt6rRqdg0IGhDDkJkrOpQL54NHVSMVzziTkFndrYxZCDQZF5kd0rR6KeWXpTHH25bascPiEi4WDWWK6TsrRgYBfk8z3SbPrVH9xXIkLtf+n8YERoLriA8bvI/oWH+1S478luSfF0cZkmsl9DPQT6pQoqaRqVD5oZLTumS0+o4KoIklresqhr0ud5Io7Iiol01OG9UlZsaQenNqpteiCItbLTShxrFdgRViw4quQYqcZsaUeEHtIImDPrYvLu02xjAiyb5Taw6fSV6dBiKj2i2cI0EiUyLRmCMluzymixvjXBbB2oYbw68XOabiDeCsbtZshsOLNlsJ/iZpO9vBWIkMsdPMyO/Pj91qiD38CJCd5mguYciLT0moWeU06JfG7cM2EBcpgFSN6kwaLmdIdVJWO70SQHfjermytomC+taQfMNM96EIQ05pxDb8tRLZ7jdks1XbwKayI2djmn5wKpUqhwTbVXPQIpYZsJG73GK6ehtbGYHAyNxGRxXXx8nl6cXJxeHtjR6NCbcAqxjNFwW7H2QT+IclSdsaV7uQ/VU9pemW+knAKvEe43lbX8taMypNozRc0JNOeFHc64E/M0eDsidrzwH3W2WqBWKcVm0drB4RL5iVwXbWNOI1uQJ5n9F6BSXSC8y7SRK1IdoAPf3UeS+luKe2Uxq6LsqSykQyMXBp1D/AAnoVm0KiF2C6PZ9GLXMMrnNPIhSl9r2bjpafCqun/Y7/wBTyHQ5qgxoBttXR7bo1lYjwuEnaA3O4GRXORWkOtvFh9ir8uP3HHg0KO5mQVtkGGcFlwlegm0LOOQsX27PhnMIUfY7vwmY5FGhOV6BHVpYxduefAc2+xPDi2yW5S2iw1ZzVCmwWSE23Wg3EbimWzwY60oEWYWK0iUxO+1WYcaS1KVjme1uyw1023PmON4PWXBZeynmYstLHDjIhdV2geHNGc1zUGLU8vnILpm6GyZJiO3CUhiVm/ybx/jpym1YMo8QD6j1t91CFCRo3je52ZJAyGA5I8KBvXJe3Zj0D3eqSudzoUkjdo1mnzipNEsR0TDjz/REDdENlPM9FobGpndvv8LrD7FUQDkkU5bLuFZMpqu4KrRmqhsbaQIENx8Qu1H3WlEXdjlMpuPPyxuN1WfEagEWqxHKz6XTWME3va0akBKnBYirvdasSm9rIINWGHRXZNFnMrPfHpkfKAzm6W/9lLLORTHjtae3dpshiU5vwaL+K46i7MfEcXuxM10dE2GxtpcXHEm0laDKK0XTXPnlt04YeLNouzg0YI7mAK+YTciouAyCyo7EMD4csCPULj9oUctJb+Jgs/PD+7buAyXT9n41aEBi3wnhd0kqu3qJWAcDVe02OyOuhXdPlHn345aYVGcHyktOjQDvCx4DJuMiIcYXsPkfuy9PVaEDagYZRGlh18vBwsUbx2Hbtp93IGSdsUTl85KlEpwPiaQRoZqqaSiZaLTWEbVHbGHDVYDtpw2jxOaOInyvWZtPtGapbAE3fUbhuC3jd30zcXU0osaKwIGYu5LHpNPY20uAG+1cpR3RHum4jUvNk+Np4K7SQyH4yQPzOFUf2MvTyumscdrVLp1e4GWtnzkVgbVphIMJkg0mbyPxOF0ze6WqakbSL7GWD6j5juGCHR6MM1HPk36i+HHr3VeDAPwK2IUkUhssU53KSoNT5NJGmch84J0w6qTtE9TMhC4AcUUAywSaSkM+SiSMjxSAJx6J6mvVAhuSM2mxRYItmpt5kFCLB8KQIulPgtTKzorjMu1SlQ40S+kPlk2z7KszYUKc3B7zm4/ZaoOTT0CaTjgOf6pXK05jIFAo7WWNY1o4BHbw5KLQdOATTzd7LLQtU/AoVRm7mhmrn1KTYo+A+6QEFX95pyBl0UWxvlgTl7sJc5oDS2HSKkWqbA8S/ubaOYnyC3KdArCy/wBVx73EiwydYQcnC0dV1+yqYI0Nrxfc4ZOFjhzXVw5etOTnw1dudpWzQ8ScLriDJzf6SqL4MeHYCIrcneF/Wwrso9HncqceBoumSVzbriaTEH4qO9pzAlyKpd21x/y47tLx6rso8AZciVTfDCxljG5lWJR6KcILW6uNvIWojtngmb5GVwAkOd5Wi4gKjSo8gSSsW6bk2rUmMyE0usaBjK391ysaM6O+s6crmi2wfdXqWXRnWghgNgz1KsQqLIXLnyy26MMNK8GjyFyMGSVpsOSg7jyWGwak/hTOboihu9M5MAVPk0lKs3IJJE6oMOY5KTGyxVesTZM+ifu8weJCGx6zR+6bvWfAShHcOaRfq35wQNDfxIy6JhStEIRP6eqQibuA9kDQnfTzUXv1PL7KLogzPAD2S73fyCDKYzJQyG/CpsiT/UJSJNhG6ViQJss0QtO8cEJ5zI+bwl8sISCYZiRy+yI1+8ITWHAkbxeiB5AvHzXBBpjmrOyqf3ESbv8ALiSDvyuuDtxuO4Km52ihEiTmC2YK3jl43bGWPlNO+nMTVaklcdQafSIIlDIezBrjaNAckaN2ijEf5IH99nouqcuOnHeHKVpUl6zqRFDRMkAZkyWZHpcd972s/pEzzKqmiC9xc85uJdyFwWMuWfSmPDftOk7VBsYC7W5vPHgqL3Od5regV6pZj6KEh8Nqjc7VphIBcLvRMCcAEcESskoRH5Gay0EQUPu/k1MuO7khvIxCQRMM4kc0JzdeSnu9EOI4/LEyKoNUkPvEkidO0tGadxbgDyTNngekknz+o/NyFEgBkU53eqHI3zdJSEMSxKAmJ5D5omJ3dFCoMBw+8kpaT4/cpkJP+ngUnA5DnYo1RZ4Rx/VMG6D2QaUz+WXOaUwcvVRqW3DmlV/p3XpBIuGnApizQ7pFMHHIeik17jxy+WIBxLH0Uw+V3MD1Q5Gfz1RANevsgifv9VEFMW5S43ppHRMGfK73UHHROZ5hRLc5+yNDaBdr6e6gXn4fYKbmjLqhkjQICDntxI0zQyAbpohijPomcZ3AoAJnl1CG4HQcUV8NxvEuKE4EWTSCJbZfMaBRcd5+bknEXTvwCi8N/MgkX1fp4koJiaDgEQvH080J8X5JMirnPokhd8M+o+6SBp1ne/LSfRN3pxEvX1ThoAxG9Is0nx/ZDQbn6yPE8kpzz+ZKcuHC1SaNDy+6Ai06y1/dMXfmJ3foFOWYHp0l7prN2llvVARJzu1KYNOAs3yUwbcFKsL5TSAQacBLjZwTydnyKk6MP2E0wfPBAJoP6pi058cUTvKtw+yEYh45Wy54oBFwFgqnTHenM8PRM11tydzshxkgyDd44pVZ5cZKL35jioi39k4STmH6pcLPZQdDzceScN5ZSCVe2VyAbu2i2ZO/7KBcMlI1fk+qG+ONeiAcRDu4eqgZm53KSi6JoEN8Q7t1iWxpN4OXX7KvEZqNyQnqhuZogIuMsSdLPZCrZTUywnh8uCi6GJ2pBB7/AJOR5IZMsESI1vHcoOA1+fMEyQr6df0SS8OXqnQPTsceSHikktAzlI+VJJAVx5R8xUY144pJJHEoXmO4KYvPBJJAMVA4bwkkkBcOaTEySAcJkkkAN14U4dw4pJJwUOkKo1JJFEHwCg75zSSSNCH7lRh+6SSQon6qu3ypJLTKuy88EN9x3pJJBA3qUS5OkgVQSSSSJ//Z',
        category: 'ice-cream',
        description: 'Rich homemade vanilla ice cream',
        unit: 'ml',
        measurement: 'volume',
        step: 100,
        min: 100
    },
    {
        id: '6',
        name: 'Goat Cheese',
        price: 7.49,
        image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=300',
        category: 'cheese',
        description: 'Creamy artisanal goat cheese',
        unit: 'g',
        measurement: 'weight',
        step: 50,
        min: 50
    },
];

const categories = [
    { id: 'all', name: 'All Products', icon: 'grid' },
    { id: 'milk', name: 'Milk', icon: 'cafe' },
    { id: 'cheese', name: 'Cheese', icon: 'nutrition' },
    { id: 'yogurt', name: 'Yogurt', icon: 'ice-cream' },
    { id: 'butter', name: 'Butter', icon: 'fast-food' },
    { id: 'ice-cream', name: 'Ice Cream', icon: 'snow' },
];

const DairyShopScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState({});
    const [scaleAnim] = useState(new Animated.Value(1));
    const [editingQuantities, setEditingQuantities] = useState({});

    const filteredProducts = selectedCategory === 'all'
        ? dairyProducts
        : dairyProducts.filter(product => product.category === selectedCategory);

    const formatQuantity = (product, quantity) => {
        if (product.measurement === 'weight' && quantity >= 1000) {
            return `${(quantity / 1000).toFixed(1)}kg`;
        }
        if (product.measurement === 'volume' && quantity >= 1000) {
            return `${(quantity / 1000).toFixed(1)}L`;
        }
        return `${quantity}${product.unit}`;
    };

    const parseQuantity = (value, product) => {
        if (!value) return product.min;

        // Handle kg/L conversions
        if (value.toLowerCase().includes('kg') && product.measurement === 'weight') {
            const num = parseFloat(value) * 1000;
            return isNaN(num) ? product.min : Math.max(product.min, num);
        }
        if (value.toLowerCase().includes('l') && product.measurement === 'volume') {
            const num = parseFloat(value) * 1000;
            return isNaN(num) ? product.min : Math.max(product.min, num);
        }

        const num = parseFloat(value);
        return isNaN(num) ? product.min : Math.max(product.min, num);
    };

    const addToCart = (productId, amount = null) => {
        const product = dairyProducts.find(p => p.id === productId);
        const quantityToAdd = amount || product.min;

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setCart(prevCart => ({
            ...prevCart,
            [productId]: {
                quantity: ((prevCart[productId]?.quantity) || 0) + quantityToAdd,
                customAmount: prevCart[productId]?.customAmount || false
            },
        }));
    };

    const removeFromCart = (productId, amount = null) => {
        const product = dairyProducts.find(p => p.id === productId);
        const quantityToRemove = amount || product.min;

        setCart(prevCart => {
            const currentItem = prevCart[productId];
            if (!currentItem) return prevCart;

            const newQuantity = currentItem.quantity - quantityToRemove;

            if (newQuantity <= 0) {
                const newCart = { ...prevCart };
                delete newCart[productId];
                return newCart;
            }

            return {
                ...prevCart,
                [productId]: {
                    ...currentItem,
                    quantity: newQuantity
                }
            };
        });
    };

    const updateCartQuantity = (productId, newQuantity) => {
        const product = dairyProducts.find(p => p.id === productId);
        const validQuantity = Math.max(product.min, newQuantity);

        setCart(prevCart => ({
            ...prevCart,
            [productId]: {
                quantity: validQuantity,
                customAmount: true
            },
        }));

        setEditingQuantities(prev => ({ ...prev, [productId]: false }));
    };

    const getCartCount = () => {
        return Object.values(cart).reduce((sum, item) => sum + 1, 0);
    };

    const getTotalPrice = () => {
        return Object.entries(cart).reduce((total, [productId, item]) => {
            const product = dairyProducts.find(p => p.id === productId);
            return total + (product?.price || 0) * item.quantity;
        }, 0);
    };

    const ProductCard = ({ item }) => {
        const cartItem = cart[item.id];
        const quantity = cartItem?.quantity || 0;
        const isEditing = editingQuantities[item.id];

        return (
            <View style={styles.productCard}>
                <View style={styles.cardInner}>
                    {item.popular && (
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularText}>Popular</Text>
                        </View>
                    )}

                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                        <View style={styles.imageOverlay} />
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productDescription}>{item.description}</Text>

                        <View style={styles.unitPriceRow}>
                            <Text style={styles.productUnit}>Per {item.min}{item.unit}</Text>
                            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                        </View>

                        {quantity === 0 ? (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => addToCart(item.id)}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addButtonText}>ጨምር</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.quantitySection}>
                                {isEditing ? (
                                    <View style={styles.quantityInputContainer}>
                                        <TextInput
                                            style={styles.quantityInput}
                                            value={formatQuantity(item, quantity)}
                                            onChangeText={(text) => {
                                                const newQuantity = parseQuantity(text, item);
                                                updateCartQuantity(item.id, newQuantity);
                                            }}
                                            onBlur={() => setEditingQuantities(prev => ({ ...prev, [item.id]: false }))}
                                            autoFocus
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.quantityUnit}>{item.unit}</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.quantityDisplay}
                                        onPress={() => setEditingQuantities(prev => ({ ...prev, [item.id]: true }))}
                                    >
                                        <Text style={styles.quantityText}>
                                            {formatQuantity(item, quantity)}
                                        </Text>
                                        <Ionicons name="pencil" size={12} color="#4A6572" />
                                    </TouchableOpacity>
                                )}

                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => removeFromCart(item.id)}
                                        onLongPress={() => {
                                            Alert.alert(
                                                "Remove Item",
                                                "Remove this item from cart?",
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Remove",
                                                        style: "destructive",
                                                        onPress: () => removeFromCart(item.id, quantity)
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="remove" size={16} color="#4A6572" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => addToCart(item.id)}
                                        onLongPress={() => addToCart(item.id, item.step * 2)}
                                    >
                                        <Ionicons name="add" size={16} color="#4A6572" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const CategoryButton = ({ category }) => {
        const isSelected = selectedCategory === category.id;

        return (
            <TouchableOpacity
                style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                onPress={() => setSelectedCategory(category.id)}
            >
                <Ionicons
                    name={category.icon}
                    size={20}
                    color={isSelected ? '#fff' : '#4A6572'}
                />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {category.name}
                </Text>
            </TouchableOpacity>
        );
    };
  
  const formatted =getEthiopianDateWithAmharic().fullDate;
    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/images/Bg.jpg')}
                style={styles.background}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>ለገበያ ያቀረብናቸው ምርቶች-{formatted}</Text>
                        <Text style={styles.subtitle}>ደንበኛ የፈለጋቸውን ሚርቶችን ከመጠናቸው ጋር ከታች ይምረጡ</Text>
                    </View>

                    {/* <View style={styles.cartContainer}>
                    <Ionicons name="cart" size={24} color="#4A6572" />
                    {getCartCount() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                        </View>
                    )}
                </View>*/}
                </View>

                {/* Products Grid */}
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => <ProductCard item={item} />}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.productsGrid}
                    showsVerticalScrollIndicator={false}
                />

                {/* Cart Summary */}
                {getCartCount() > 0 && (
                    <Animated.View style={[styles.cartSummary, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.cartSummaryContent}>
                            <View>
                                <Text style={styles.cartTotalText}>አጠቃላይ ሂሳብ: ${getTotalPrice().toLocaleString()} ብር</Text>
                                <Text style={styles.cartItemsText}>{getCartCount()} ምርት ተመርጧል
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.checkoutButton}>
                                <Text style={styles.checkoutButtonText}>ሂሳብ መዝግብ</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        // borderBottomWidth: 1,
        // borderBottomColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
        textAlign: 'center',
        borderRadius: 20,
        border: '2px solid #E0E0E0'
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#2D3748',
        marginLeft: 14,
    },
    subtitle: {
        fontSize: 14,
        color: '#ffff',
        marginTop: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,

    },
    cartContainer: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#F56565',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productsGrid: {
        padding: 10,
    },
    productCard: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        maxWidth: (width - 40) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    cardInner: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        // 3D effect with multiple shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    popularBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#F56565',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    popularText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 8,
        lineHeight: 16,
    },
    unitPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    productUnit: {
        fontSize: 11,
        color: '#A0AEC0',
        fontWeight: '500',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A6572',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A6572',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#4A6572',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minWidth: 80,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
        marginRight: 4,
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4A6572',
        minWidth: 80,
    },
    quantityInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
        padding: 0,
    },
    quantityUnit: {
        fontSize: 12,
        color: '#A0AEC0',
        marginLeft: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        marginHorizontal: 2,
    },
    cartSummary: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cartSummaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cartItemsText: {
        fontSize: 14,
        color: '#718096',
    },
    cartTotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0ad756ff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: '#0ad756ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginLeft: 10,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
    },
});

export default DairyShopScreen;