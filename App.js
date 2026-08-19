import {useState} from 'react';
import {StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, Modal} from 'react-native';

//importamos el motor de la camara y los iconos nativos
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';


export default function App() {
//Galeria guarda todas las fotos, Cada foto sera un objeto asi: 
    const [galeria, setGaleria] = useState([]);

    const [seleccionadas, setSeleccionadas] = useState([]);

    const [fotoExpandida, setFotoExpandida] = useState(null);


const tomarfoto = async () => {

    if(galeria.length >= 6){
        Alert.alert('Limite de fotos alcanzado', 'Solo puedes tomar 6 fotos');
        return; //Detiene la funcion inmediatamente
    }

    //Solicitar permiso para acceder a la camara
    const permisos = await ImagePicker.requestCameraPermissionsAsync();
    if (permisos.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a la camara');
        return;
    }

    //Configurar y abrir la camara
    const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true, //Abre la pantalla intermedia para recortar la foto
        aspect: [1, 1], //Obliga a que el recorte sea un cuadrado perfecto (1:1)
        quality: 0.5, //Comprime la foto al 50% para no llenar la memoria del telefono
    });

    //4. Procesar el resultado: Si el usuario no cancelo la captura
    if (!resultado.canceled) {
        //Creamos un nuevo objeto empaquetando la ruta de la foto y un ID basado en la hora actual
        const nuevaFoto = {
            id: Date.now().toString(),
            uri: resultado.assets[0].uri,
        };

        //Clonamos la galeria anterior (... galeria) y le agregamos la foto nueva al final
        setGaleria([...galeria, nuevaFoto]);
    }
};


//Esta funcion se dispara cuando el usuario MANTIENE PRESIONADA la foto
const alternarSeleccion = (idfoto) => {
    //Si la foto ya estaba en el carrito de seleccionadas...
    if (seleccionadas.includes(idfoto)) {
        //...la quitamos del carrito
        setSeleccionadas(seleccionadas.filter((id) => id !== idfoto));
    } else {
        //...si no estaba, la agregamos al carrito
        setSeleccionadas([...seleccionadas, idfoto]);
    }
};


//En esta funcion se dispara con el boton de la esquina inferior derecha
const seleccionarTodas = () => {
    //Si la cantidad seleccionadas es igual a la cantidad total, significa que ya estan todas marcadas
    if(seleccionadas.length === galeria.length){
        setSeleccionadas([]); //Vaciamos el carrito (Desmarcar Todas)
    } else {
        //Extraemos solo los ID de toda la galeria usando .map() y los metemos al carrito (Marcar todas)
        const todosLosIds = galeria.map((foto) => foto.id);
        setSeleccionadas(todosLosIds);
    }
};


//En esta funcion se dispara con el boton de basura
const BorrarSeleccionadas = () => {
    Alert.alert(
        'Confirmar borrado',
        `¿Eliminar ${seleccionadas.length} fotos seleccionadas?`,
        [
            {
                text: 'Cancelar',
                style: 'cancel'
            },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    //MAGIA DE JAVASCRIPT: Filtramos la galeria para quedarnos unicamente
                    // con las fotos cuyo ID no exista en el arreglo de 'seleccionadas'
                    const galeriaFiltrada = galeria.filter((foto) => !seleccionadas.includes(foto.id));
                    setGaleria(galeriaFiltrada);
                    setSeleccionadas([]); //Limpiamos el carrito despues de borrar
                }
            }
        ]
    );
};


return (
    <View style={styles.contenedor}>

        {/* ENCABEZADO */}
        <View style={styles.encabezado}>
            <Text style={styles.titulo}>Mi Galeria</Text>
            <Text style={styles.contenedorTexto}>Fotografias: {galeria.length} / 6</Text>
        </View>

        {/* --- ZONA CENTRAL: LA CUADRICULA DE FOTOS --- */}
        {galeria.length === 0 ? (
            //RENDERIZADO CONDICIONAL: Si no hay fotos, mostramos un mensaje
            <View style={styles.estadoVacio}>
                <Ionicons name="images-outline" size={60} color="#ccc" />
                <Text style={styles.textoVacio}>Aun no has tomado ninguna foto</Text>
            </View>
        ) : (
            //Si si hay fotos, dibujamos la lista inteligente de dos columnas
            <FlatList
                data={galeria}
                keyExtractor={(item) => item.id}
                numColumns={2}
                style={styles.lista}
                renderItem={({ item }) => {
                    //Verificamos si esta foto especifica esta dentro de nuestro carrito
                    const estaSeleccionada = seleccionadas.includes(item.id);

                    return (
                        <TouchableOpacity
                            style={styles.contenedorFoto}
                            //Toque rapido: Abre el modal enviandole la ruta de la imagen
                            onPress={() => setFotoExpandida(item.uri)}
                            //Toque largo: Activa el modo seleccion pasandole el ID
                            onLongPress={() => alternarSeleccion(item.id)}
                        >
                            {/* Dibujamos la imagen. Si esta seleccionada, le aplicamos estilos extra (Borde morado) */}
                            <Image
                                source={{ uri: item.uri }}
                                style={[styles.imagen, estaSeleccionada && styles.fotoSeleccionada]}
                            />

                            {/* Si esta seleccionada, dibujamos un icono de check en la esquina superior derecha */}
                            {estaSeleccionada && (
                                <View style={styles.checkOverlay}>
                                    <Ionicons name="checkmark-circle" size={24} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        )}
        

        {/* --- CONTROLES INFERIORES --- */}

        {/* Boton para tomar fotografias */}
        <View style={styles.barraCamara}>
            <TouchableOpacity style={[styles.botonCamara, { backgroundColor: '#67069c' }]} onPress={tomarfoto} >
                <Ionicons name="camera" size={28} color="#faf5f5" />
                <Text style={styles.textoBotonCamara}>Tomar foto</Text>
            </TouchableOpacity>
        </View>

        {/* 2. Fila secundaria: Contiene los botones de eliminar y seleccionar */}
        <View style={styles.filaSecundaria}>

            {/* LADO IZQUIERDO: Boton de eliminar (Renderizado condicional: &&) */}
            <View style={styles.mitadFila}>
                {seleccionadas.length > 0 && (
                    <TouchableOpacity style={styles.botonIconoTexto} onPress={BorrarSeleccionadas}>
                        <Ionicons name="trash" size={24} color="#e74c3c"/>s
                        <Text style={[styles.textoBotonSecundario, {color: "#e74c3c"}]}>
                            ({seleccionadas.length})
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* LADO DERECHO: Boton de seleccionar todas (Solo aparece si hay galeria) */}
            <View style={[styles.mitadFila, {alignItems: 'flex-end'}]}>
                {galeria.length > 0 && (
                    <TouchableOpacity style={styles.botonIconoTexto} onPress={seleccionarTodas}>
                        <Ionicons
                            //Si estan seleccionadas todas, cambia el icono a una 'X'
                            name={seleccionadas.length === galeria.length ? 'close-circle' : 'checkmark-done-circle-outline'}
                            size={20}
                            color={seleccionadas.length === galeria.length ? '#e74c3c' : '#f80cb9'}
                        />

                        <Text style={[
                            styles.textoBotonSecundario,
                            {color: seleccionadas.length === galeria.length ? '#e74c3c' : '#ea0dd4'}
                        ]}>
                            {seleccionadas.length === galeria.length ? 'Desmarcar' : 'Seleccionar todas'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* El modal solo es visible si 'fotoExpandida' tiene informacion (!== null) */}
        <Modal visible={fotoExpandida !== null} transparent={true} animationType="fade">
            <View style={styles.fondoModal}>

                {/* Boton flotante para cerrar. Al presionarlo, limpiamos el estado de 'fotoExpandida' */}
                <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setFotoExpandida(null)}>
                    <Ionicons name="close" size={40} color="white"/>
                </TouchableOpacity>

                {/* Mostramos la imagen. 'resizeMode="contain"' hace que la imagen se ajuste a la pantalla sin deformarse */}
                <Image source={{uri: fotoExpandida}} style={styles.imagenCompleta} resizeMode="contain"/>
            </View>
        </Modal>

    </View>
);
}


const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },

    encabezado: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },

    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ac14f2',
    },

    contenedorTexto: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },

    estadoVacio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textoVacio: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },

   lista: {
    flex: 1,
    paddingHorizontal: 5,
    marginBottom: 5,
},

    contenedorFoto: {
        flex: 1,
        margin: 5,
        position: 'relative',
    },

    imagen: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
    },

    fotoSeleccionada: {
        borderWidth: 4,
        borderColor: '#9b59b6',
    },

    checkOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },

    barraCamara: {
        alignItems: 'center',
        paddingVertical: 10,
    },

    botonCamara: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
    },

    textoBotonCamara: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },

    filaSecundaria: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
    paddingBottom: 15,
},

    mitadFila: {
        flex: 1,
    },

    botonIconoTexto: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    textoBotonSecundario: {
        fontSize: 15,
        fontWeight: '600',
    },

    fondoModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    botonCerrarModal: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },

    imagenCompleta: {
        width: '100%',
        height: '80%',
    },

});