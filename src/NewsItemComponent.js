const NewsItemComponent = ({ newsItem }) => {
    return (
        <div className="news-item">
            <h3><a href={newsItem.link} target="_blank" rel="noopener noreferrer">{newsItem.title}</a></h3>
            <p>{newsItem.description}</p>
            <p>Published on: {newsItem.pubDate}</p>
            <p>Source: {newsItem.source}</p>
        </div>
    );
};

export default NewsItemComponent;
