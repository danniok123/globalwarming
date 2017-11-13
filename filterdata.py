import pandas as pd
import numpy as np
from dateutil import parser

def timeParse(x):
	return parser.parse(x).year 

data = pd.read_csv('data/GlobalLandTemperaturesByState.csv')


data = data[data['Country'] == 'United States']

#data = data[data['dt'] >= 1940]

#data = data[parser.parse(data['dt']).year >= '1940']

#data['dt'] = pd.to_datetime(data['dt'])

"""for i in range(len(data['dt'])):
	tmp.append(data['dt'][i])"""

#new_column = pd.DataFrame({'Month': list(np.arange(1,13))*65 * 65})
#data = data.merge(new_column, left_index = True, right_index = True)

#data = data[data['dt'] >= 1940]

#print(data['dt'][7458])
data.to_csv('data/GlobalLandTemperaturesByState.csv', index=False)

#print(parser.parse("7/1/99").year)