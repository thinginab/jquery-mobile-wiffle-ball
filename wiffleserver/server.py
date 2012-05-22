import cgi
import datetime
import urllib
import webapp2

from google.appengine.ext import db
from google.appengine.api import users
from os import curdir, sep


class Season(db.Model):
  name = db.StringProperty()
  date = db.DateTimeProperty(auto_now_add=True)
  
class Game(db.Model):
  name = db.StringProperty()
  seasonid = db.IntegerProperty()
  json = db.TextProperty()
  date = db.DateTimeProperty(auto_now_add=True)

def game_key():
  return db.Key.from_path('Game', users.get_current_user() or 'public')
  
def season_key():
  return db.Key.from_path('Season', users.get_current_user() or 'public')

class Save(webapp2.RequestHandler):
  def post(self):
	season = Season.all().filter("name =", self.request.get('season')).get()
	if not season:
		season = Season(parent=season_key())
		season.name = self.request.get('season')
		season.put()
	
	if self.request.get('id') :
		game = Game.get_by_id(int(self.request.get('id')),parent=game_key())
	else :
		game = Game(parent=game_key())
	game.name = self.request.get('name')
	game.seasonid = season.key().id()
	game.json = self.request.get('json')
	game.put()
	self.response.headers['Content-Type'] = 'text/json'
	self.response.headers['Access-Control-Allow-Origin'] = '*'
	self.response.out.write('{"id":"'+str(game.key().id())+'"}')



class SeasonLoad(webapp2.RequestHandler):
  def get(self,seasonname):
	self.response.headers['Content-Type'] = 'text/json'
	self.response.headers['Access-Control-Allow-Origin'] = '*'
	
	self.response.out.write('[')
	seasons = Season.all().ancestor(
			season_key()).order('-date').fetch(100)
	firstSeason = True
	for season in seasons:
		if season.name==seasonname:
			if not firstSeason: 
				self.response.out.write(',')
			firstSeason = False
			self.response.out.write('{"name":"'+season.name+'","games":[')
			games = Game.all().ancestor(
					game_key()).filter(
					'seasonid =', season.key().id()
					).order(
					'-date'
					).fetch(100)
					
			firstGame = True
			for game in games:
				if not firstGame :
					self.response.out.write(',')
				firstGame = False
				self.response.out.write(game.json)
			self.response.out.write(']}')
		else:
			self.response.out.write(season.name)
	self.response.out.write(']')
	
	
class Load(webapp2.RequestHandler):
  def get(self):
	self.response.headers['Content-Type'] = 'text/json'
	self.response.headers['Access-Control-Allow-Origin'] = '*'
	
	self.response.out.write('[')
	seasons = Season.all().ancestor(
			season_key()).order('-date').fetch(100)
	firstSeason = True
	for season in seasons:
		if not firstSeason: 
			self.response.out.write(',')
		firstSeason = False
		self.response.out.write('{"name":"'+season.name+'","games":[')
		games = Game.all().ancestor(
				game_key()).filter(
				'seasonid =', season.key().id()
				).order(
				'-date'
				).fetch(100)
				
		firstGame = True
		for game in games:
			if not firstGame :
				self.response.out.write(',')
			firstGame = False
			self.response.out.write(game.json)
		self.response.out.write(']}')
	self.response.out.write(']')

app = webapp2.WSGIApplication([('/save', Save),('/load', Load), ('/season/(.*)/load',SeasonLoad)],
                              debug=True)