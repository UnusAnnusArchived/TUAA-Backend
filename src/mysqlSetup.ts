import mysql from 'mysql'
import * as config from './config.json'

export const db = mysql.createPool(config.mysql)