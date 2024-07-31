import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [rssData, setRssData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [sortType, setSortType] = useState('');
  const [showFavourites, setShowFavourites] = useState(false);
  const [favourites, setFavourites] = useState(new Set(JSON.parse(localStorage.getItem('favourites') || '[]')));

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.journey.skillreactor.io/r/f/rss.xml');
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");

        const channel = xml.querySelector('channel');
        const rssItem = {
          title: channel.querySelector('title').textContent,
          lastBuildDate: channel.querySelector('lastBuildDate').textContent,
          link: channel.querySelector('link').textContent,
          newsList: Array.from(channel.querySelectorAll('item')).map(item => ({
            title: item.querySelector('title').textContent,
            link: item.querySelector('link').textContent,
            guid: item.querySelector('guid').textContent,
            pubDate: item.querySelector('pubDate').textContent,
            description: item.querySelector('description').textContent,
            source: item.querySelector('source').textContent.trim(),
          })),
          sources: Array.from(new Set(Array.from(channel.querySelectorAll('source')).map(source => source.textContent.trim())))
        };

        localStorage.setItem('rssData', JSON.stringify(rssItem));
        setRssData(rssItem);
      } catch (error) {
        console.error("Error fetching or parsing data: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const toggleFavourite = (guid) => {
    const newFavourites = new Set(favourites);
    if (newFavourites.has(guid)) {
      newFavourites.delete(guid);
    } else {
      newFavourites.add(guid);
    }
    setFavourites(newFavourites);
    localStorage.setItem('favourites', JSON.stringify(Array.from(newFavourites)));
  };

  const getFilteredAndSortedNewsList = () => {
    let filteredList = rssData ? rssData.newsList.filter(news =>
      (selectedDate === '' || new Date(news.pubDate).toDateString() === new Date(selectedDate).toDateString()) &&
      (!showFavourites || favourites.has(news.guid))
    ) : [];

    switch (sortType) {
      case 'newest':
        return filteredList.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      case 'oldest':
        return filteredList.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
      case 'title_asc':
        return filteredList.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return filteredList.sort((a, b) => b.title.localeCompare(a.title));
      case 'source_asc':
        return filteredList.sort((a, b) => a.source.localeCompare(b.source));
      case 'source_desc':
        return filteredList.sort((a, b) => b.source.localeCompare(a.source));
      default:
        return filteredList;
    }
  };

  if (loading) {
    return <div id="loader">Loading...</div>;
  }

  if (!rssData) {
    return <div>Unable to load data. Please try again later.</div>;
  }

  return (
    <div className="App">
      <Header data={rssData} />
      <Filters sources={rssData.sources} onDateChange={handleDateChange} onSortChange={handleSortChange} onShowFavouritesChange={setShowFavourites} />
      <NewsContent newsList={getFilteredAndSortedNewsList()} toggleFavourite={toggleFavourite} favourites={favourites} />
    </div>
  );
}

function Header({ data }) {
  return (
    <div id="header">
      <h1 id="page_title"><a href={data.link}>{data.title}</a></h1>
      <h2 id="last_build_date">{data.lastBuildDate}</h2>
    </div>
  );
}

function NewsContent({ newsList, toggleFavourite, favourites }) {
  return (
    <div id="content">
      {newsList.map(item => (
        <div key={item.guid} id={`article_${item.guid}`} className="article">
          <h4 id={`article_${item.guid}_title`}>
            <a href={item.link}>{item.title}</a>
          </h4>
          <button id={`article_${item.guid}_fav_btn`} onClick={() => toggleFavourite(item.guid)}>
            {favourites.has(item.guid) ? 'Unmark Favourite' : 'Mark as Favourite'}
          </button>
          <h5 id={`article_${item.guid}_pub_date`}>{new Date(item.pubDate).toDateString()}</h5>
          <h5 id={`article_${item.guid}_source`}>{item.source}</h5>
          <div id={`article_${item.guid}_desc`} dangerouslySetInnerHTML={{ __html: item.description }}></div>
        </div>
      ))}
    </div>
  );
}

function Filters({ sources, onDateChange, onSortChange, onShowFavouritesChange }) {
  return (
    <div>
      <input type="checkbox" id="show_favourites" onChange={e => onShowFavouritesChange(e.target.checked)} /> Show Favourites<br />
      <input type="date" id="selected_date" onChange={e => onDateChange(e.target.value)} /><br />
      {sources.map(source => (
        <button key={source} id={`source_${source.replace(/\s+/g, '_').toLowerCase()}`}>
          {source}
        </button>
      ))}
      <select id="sort_input" onChange={onSortChange}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title_asc">Title Ascending</option>
        <option value="title_desc">Title Descending</option>
        <option value="source_asc">Source Ascending</option>
        <option value="source_desc">Source Descending</option>
      </select>
    </div>
  );
}

export default App;
