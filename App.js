import {useState, useEffect, useRef} from 'react';
//Importamos animated, para hacer movimiento fluido sin que se trabe el celular
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, FlatList, Image, ActivityIndicator, Keyboard } from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Audio} from 'expo-av'; //La libreria para reproducir musica

export default function App() {

    //1. Las memorias de la pantalla (lo que el usuario ve)

    const [busqueda, setBusqueda] = useState(''); //Lo que el usuario escribe en el input
    const [resltados, setResultados] = useState([]); //Los resultados de la busqueda
    const [cargando, setCargando] = useState(false); //Para mostrar el indicador de carga
    const [cancionActiva, setCancionActiva] = useState(null); //La cancion que se esta reproduciendo
    const [sonidoActual, setSonidoActual] = useState(null); //El sonido que se esta reproduciendo
    const [estareproduciendo, setEstareproduciendo] = useState(false); //Para saber si se esta reproduciendo musica

    //3. LA ANIMACION FLUIDA

    //USAMOS useref en lugar de usestate
    //Esto crea una memoria super rapida que no trabe la pantalla

    const animacionEcualizador = useRef(new Animated.Value(0)).current; //El valor de la animacion del ecualizador

    //Este bloque de codigo esta "Escuchando" al boton de play
    useEffect(() => {

        //Regla de oro: antes de animar, siempre regresamos las barras a 0
        animacionEcualizador.stopAnimation(); //Detenemos la animacion
        animacionEcualizador.setValue(0); //Regresamos el valor a 0

        if (estareproduciendo) {
            //Si hay musica sonando, hacemos que el valor suba
            Animated.loop(
                Animated.sequence([
                    //Sube del 0 al 1 en medio segundo (300 ms)
                    Animated.timing(animacionEcualizador, {toValue:1, duration: 300, useNativeDriver: false}),
                    //Baja del 1 al 0 en medio segundo (300 ms)
                    Animated.timing(animacionEcualizador, {toValue:0, duration: 300, useNativeDriver: false}),
                ])
            ).start(); //Que empiece a moverse
        }

        //Le decimos que tambien se reinicie si el usuario cambia de cancion.
    }, [estareproduciendo, cancionActiva]); 

    //LA MAGIA: Convertimos ese 0 a 1 que sube y baja, en tamaños reales
    const altoBarra1 = animacionEcualizador.interpolate({ inputRange: [0, 1], outputRange: [8, 22] });
    const altoBarra2 = animacionEcualizador.interpolate({ inputRange: [0, 1], outputRange: [24, 10] });
    const altoBarra3 = animacionEcualizador.interpolate({ inputRange: [0, 1], outputRange: [12, 18] });

    //4. IR A INTERNET A BUSCAR LA CANCION

    const buscarCancion = async () => {
        // Si la caja de texto esta vacia, nos salimos
        if (busqueda.trim() === '') return;

        Keyboard.dismiss(); //Escondemos el teclado del celular
        setCargando(true); //Encendemos la ruedita de carga

        try {
            //Internet odia los espacios en blanco. Convertimos "Daft Punk" a "Daft+Punk"
            const terminoLimpio = busqueda.replace(/ /g, '+');

            const url = `https://itunes.apple.com/search?term=${terminoLimpio}&media=music&limit=30`;

            const respuesta = await fetch(url);
            const json = await respuesta.json(); //Traducimos la respuesta
            setResultados(json.results); //Guardamos la lista en nuestra memoria
        } catch (error){
            console.error(error);
        } finally {
            setCargando(false); //Apagamos la ruedita de carga (incluso si fallo el internet)
        }
    };

    //5. HACER QUE SUENE EL SONIDO

    //Este vigilante nos avisa automaticamente en el segundo exacto en el que termina la cancion
    const monitorDeReproduccion = (estado) => {
        if (estado.didJustFinish){
            setEstareproduciendo(false);
            setCancionActiva(null);
        }
    };

    const reproducirCancion = async (cancion) => {
        try {
            //Regla de oro: Si tocas otra cancion, primero borramos la parte anterior para no mezclarla
            if (sonidoActual){
                await sonidoActual.unloadAsync();
            }

            setCancionActiva(cancion); //Avisamos cual es la nueva cancion
            setEstareproduciendo(true); //Encendemos el play visual

            //Configuramos el celular para que el sonido funcione aunque este en modo silencio
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true
            });

            //Preparamos la cancion y le conectamos nuestro vigilante
            const { sound } = await Audio.Sound.createAsync(
                { uri: cancion.previewUrl }, //El fragmento de 30 segundos
                {shouldPlay: true}, //Le decimos que arranque solita
                monitorDeReproduccion //Aqui esta el vigilante conectado
            );

            setSonidoActual(sound); //Guardamos el motor listo

        } catch(error) {
            console.log("Error al reproducir", error); 
        }
    };

    //Funcion para el boton del mini reproductor
    const alternarPlaypause = async () =>{
        if (!sonidoActual) return;

        if(estareproduciendo){
            await sonidoActual.pauseAsync(); //Pausa
            setEstareproduciendo(false);
        } else {
            await sonidoActual.playAsync(); //Play
            setEstareproduciendo(true);
        }
    };

    //Cuando cambiamos de sonido, eliminamos el sonido anterior de la memoria
    useEffect(() => {
        return sonidoActual
            ? () => {
                sonidoActual.unloadAsync();
            }
            : undefined;
    }, [sonidoActual]);
    
        
    //6. DIBUJAR LA PANTALLA (Renderizado visual)

    return (
    <View style={styles.contenedor}>

        {/* PARTE SUPERIOR: TITULO Y BUSCADOR */}
        <View style={styles.encabezado}>
            <Text style={styles.tituloHeader}>Explorar Musica</Text>

            <View style={styles.contenedorBusqueda}>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar cancion o artista"
                    placeholderTextColor="#888"
                    value={busqueda}
                    onChangeText={setBusqueda}
                    onSubmitEditing={buscarCancion}
                />

                <TouchableOpacity
                    style={styles.botonBuscar}
                    onPress={buscarCancion}
                >
                    <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>

        {cargando ? (

            <View style={styles.zonaCentrada}>
                <ActivityIndicator size="large" color="#A259FF"/>
            </View>

        ) : (

            <FlatList
                data={resltados}
                keyExtractor={(item) => item.trackId.toString()}
                contentContainerStyle={{
                    paddingBottom: cancionActiva ? 90 : 20
                }}
                renderItem={({item}) => {

                    const esLaActiva =
                        cancionActiva?.trackId === item.trackId;

                    return (
                        <TouchableOpacity
                            style={styles.tarjetaCancion}
                            onPress={() => reproducirCancion(item)}
                        >

                            <Image
                                source={{uri: item.artworkUrl100}}
                                style={styles.portada}
                            />

                            <View style={styles.infoCancion}>

                                <Text
                                    style={[
                                        styles.tituloCancion,
                                        esLaActiva && {color: "#A259FF"}
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.trackName}
                                </Text>

                                <Text
                                    style={styles.artistaCancion}
                                    numberOfLines={1}
                                >
                                    {item.artistName}
                                </Text>

                            </View>

                            {esLaActiva && estareproduciendo ? (

                                <View style={styles.contenedorEcualizador}>

                                    <Animated.View
                                        style={[
                                            styles.barraEcualizador,
                                            {height: altoBarra1}
                                        ]}
                                    />

                                    <Animated.View
                                        style={[
                                            styles.barraEcualizador,
                                            {height: altoBarra2}
                                        ]}
                                    />

                                    <Animated.View
                                        style={[
                                            styles.barraEcualizador,
                                            {height: altoBarra3}
                                        ]}
                                    />

                                    <Ionicons
                                        name="play-circle"
                                        size={32}
                                        color="#A259FF"
                                    />

                                </View>

                            ) : (

                                <Ionicons
                                    name="play-circle"
                                    size={32}
                                    color="#1444"
                                />

                            )}

                        </TouchableOpacity>
                    );
                }}
            />

        )}

        {cancionActiva && (

            <View style={styles.miniReproductor}>

                <View style={styles.interiorMiniReproductor}>

                    <Image
                        source={{
                            uri: cancionActiva.artworkUrl100
                        }}
                        style={styles.portadaMini}
                    />

                    <View style={styles.infoMini}>

                        <Text
                            style={styles.tituloMini}
                            numberOfLines={1}
                        >
                            {cancionActiva.trackName}
                        </Text>

                        <Text
                            style={styles.artistaMini}
                            numberOfLines={1}
                        >
                            {cancionActiva.artistName}
                        </Text>

                    </View>

                    <TouchableOpacity
                        onPress={alternarPlaypause}
                        style={styles.botonPlayPause}
                    >
                        <Ionicons
                            name={
                                estareproduciendo
                                    ? "pause-circle"
                                    : "play-circle"
                            }
                            size={40}
                            color="white"
                        />
                    </TouchableOpacity>

                </View>

            </View>

        )}

    </View>
    );
}

const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingTop: 60
    },

    encabezado: {
        paddingTop: 10
    },

    tituloHeader: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: 15,
        textAlign: "center"
    },

    contenedorBusqueda: {
        flexDirection: "row",
        paddingHorizontal: 15,
        marginBottom: 15
    },

    input: {
        flex: 1,
        height: 50,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16
    },

    botonBuscar: {
        width: 50,
        height: 50,
        backgroundColor: "#A259FF",
        borderRadius: 10,
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center"
    },

    zonaCentrada: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    tarjetaCancion: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        marginHorizontal: 15,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10
    },

    portada: {
        width: 60,
        height: 60,
        borderRadius: 8
    },

    infoCancion: {
        flex: 1,
        marginLeft: 10
    },

    tituloCancion: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50"
    },

    artistaCancion: {
        fontSize: 14,
        color: "#7f8c8d",
        marginTop: 3
    },

    contenedorEcualizador: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3
    },

    barraEcualizador: {
        width: 4,
        backgroundColor: "#A259FF",
        borderRadius: 2
    },

    miniReproductor: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#A259FF",
        padding: 10
    },

    interiorMiniReproductor: {
        flexDirection: "row",
        alignItems: "center"
    },

    portadaMini: {
        width: 50,
        height: 50,
        borderRadius: 6
    },

    infoMini: {
        flex: 1,
        marginLeft: 10
    },

    tituloMini: {
        color: "white",
        fontSize: 15,
        fontWeight: "bold"
    },

    artistaMini: {
        color: "white",
        fontSize: 13
    },

    botonPlayPause: {
        justifyContent: "center",
        alignItems: "center"
    }
});