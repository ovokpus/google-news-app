import NewsItemComponent from './NewsItemComponent';

const NewsFeedComponent = ({ rssData }) => {
    return (
        <div>
            <h1>{rssData.title}</h1>
            <p>Last Updated: {rssData.lastBuildDate}</p>
            {rssData.newsList.map((newsItem, index) => (
                <NewsItemComponent key={index} newsItem={newsItem} />
            ))}
        </div>
    );
};

export default NewsFeedComponent;
