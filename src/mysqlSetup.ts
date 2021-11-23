import mysql from 'mysql'
import config from './config.json'

export const db = mysql.createPool(config.mysql)
