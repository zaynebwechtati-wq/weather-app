METRIC_UNITS = {

    "temperature": "°C",

    "humidity": "%",

    "windspeed": "km/h",

    "pressure": "hPa"

}


def get_unit(metric):

    return METRIC_UNITS.get(
        str(metric),
        ""
    )
