import React, { Component } from "react";
import NavigationBar from "../../components/NavigationBar";
import axios from "axios";
import shortid from "shortid";
import ProductCard from "../../components/ProductCard";
import TreeMenu from 'react-simple-tree-menu';
import 'react-simple-tree-menu/dist/main.css';
import "./Search.scss";
import {
    Card, H3, Classes, Button
} from "@blueprintjs/core";

import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import EmptyIllustration from "../../illustrations/EmptyIllustration.png";

const useStyles = makeStyles((theme) => ({
    root: {
            '& > *': {
            marginTop: theme.spacing(2),
        },
    },
}));

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            categories: [],
            searchterm: "",
            loading: false,
            limitPerPage: 40,
            currentPage: 1,
            totalPage: 1,
            start: 1,
            limit: 40,
            category: "",
            sortby: "relevance",
            status: "",
            priceMin: null,
            priceMax: null,
            popupOpened: false,
            totalItems: 0,
            searchTitle: "",
            isLoadingPageOpen: false,
            currLat: 0.0,
            currLng: 0.0,
            cardWidth: (window.innerWidth/6) - 50, 
            cardHeight: (window.innerHeight/5) - 50,
            viewportWidth: window.innerWidth,
            noItemFound: false,
        };
        this.getItems = this.getItems.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.calculateTotalPage = this.calculateTotalPage.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.onMinPriceChange = this.onMinPriceChange.bind(this);
        this.onMaxPriceChange = this.onMaxPriceChange.bind(this);
        this.categoryChange = this.categoryChange.bind(this);
        this.onPriceInputBlur = this.onPriceInputBlur.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ cardWidth: (window.innerWidth/6) - 50 });
        this.setState({ cardHeight: (window.innerHeight/5) - 50 });
        this.setState({ viewportWidth: window.innerHeight });
    }
    
    componentWillMount() {
        const urlParams = new URLSearchParams(this.props.location.search);
        const query = urlParams.get('q');
        const category = urlParams.get('category');
        const pricemax = urlParams.get('pricemax');

        let searchTerm = query;
        if(!query) {
            searchTerm = "";
        }
        this.setState({ searchterm: searchTerm });
        this.setState({ searchTitle: searchTerm });

        let categorySearch = category;
        if(!category) {
            categorySearch = "";
        }
        this.setState({ category: categorySearch });

        let status = "";
        status = "available";
        this.setState({ status: status });

        let priceMax = pricemax;
        this.setState({ priceMax: priceMax });
        if(!pricemax) {
            priceMax = 99999999999;
        }

        if(!query) {
            if(category) {
                this.setState({ searchTitle: category });
            }
        } else {
            this.setState({ searchTitle: query });
        }

        let self = this;
        axios
        .get(`https://go.2gaijin.com/search?q=` + 
        searchTerm +
        "&category=" + categorySearch +
        "&status=" + status + 
        "&sortby=relevance" +
        "&pricemax=" + priceMax + 
        "&start="+ this.state.start + "&limit=" + this.state.limit, {}, {})
        .then(response => {
            if(response.data.status == "Success") {
                var fetchData = response.data.data.items;
                
                if(fetchData.length <= 0) {
                    this.setState({ noItemFound: true });
                } else {
                    this.setState({ noItemFound: false });
                }
                
                this.setState({data: fetchData});
                this.setState({totalItems: response.data.data.total_items}, () => { self.calculateTotalPage() });
            }
            this.setState({ isLoadingPageOpen: false });
        });

        return axios
        .get(`https://go.2gaijin.com/get_categories`, {}, {})
        .then(response => {
            var fetchData = response.data.data.categories;
            var json = fetchData;
            json = JSON.parse(JSON.stringify(json).split('"children":').join('"nodes":'));
            json = JSON.parse(JSON.stringify(json).split('"name":').join('"label":'));
            json = JSON.parse(JSON.stringify(json).split('"_id":').join('"key":'));
            this.setState({categories: json});
        });
    }

    calculateTotalPage() {
        this.setState({ totalPage: Math.ceil(this.state.totalItems / this.state.limitPerPage) });
    }

    getItems() {
        let start = (this.state.currentPage - 1) * this.state.limitPerPage + 1;
        let limit = ((this.state.currentPage - 1) * this.state.limitPerPage) + this.state.limitPerPage;

        let priceMin = this.state.priceMin, priceMax = this.state.priceMax;
        if(!priceMin) {
            priceMin = 0;
        }
        if(!priceMax) {
            priceMax = 99999999999;
        }

        let self = this;
        return axios
        .get(`https://go.2gaijin.com/search?q=` + 
        this.state.searchterm +
        "&category=" + this.state.category +
        "&status=" + this.state.status + 
        "&sortby=relevance" + 
        "&pricemin=" + priceMin +
        "&pricemax=" + priceMax +
        "&start="+ start + "&limit=" + limit, {}, {})
        .then(response => {
            console.log(response.data.message);
            if(response.data.status == "Success") {
                var fetchData = response.data.data.items;

                if(fetchData.length <= 0) {
                    this.setState({ noItemFound: true });
                } else {
                    this.setState({ noItemFound: false });
                }

                this.setState({data: fetchData}, () => { window.scrollTo(0,0); });
                this.setState({ totalItems: response.data.data.total_items}, () => { self.calculateTotalPage(); });
            }
            this.setState({ isLoadingPageOpen: false });
        });
    }

    handlePageChange(event, value) {
        let self = this;
        this.setState({ currentPage: parseInt(value) }, () => { self.getItems()});
    }

    onMinPriceChange(e) {
        let minPrice = parseInt(e.target.value);
        if(minPrice <= 0) { minPrice = 0 }
        this.setState({priceMin: minPrice});
    }

    onMaxPriceChange(e) {
        let maxPrice = parseInt(e.target.value);
        if(maxPrice <= 0) { maxPrice = 0 }
        this.setState({priceMax: maxPrice});
    }

    onPriceInputBlur() {
        let self = this;
        if(this.state.priceMax){
            if(this.state.priceMin) {
                if(this.state.priceMin >= this.state.priceMax) {
                    this.setState({ priceMin: self.state.priceMax }, () => { this.getItems(); });
                    return;
                }
            }
        }
        if(this.state.priceMin){
            if(this.state.priceMax) {
                if(this.state.priceMax <= this.state.priceMin) {
                    this.setState({ priceMax: self.state.priceMin }, () => { this.getItems(); });
                    return;
                }
            }
        }

        this.getItems();
    }

    categoryChange(name) {
        let self = this;
        this.setState({ currentPage: 1 });

        if(this.state.searchterm == "") {
            this.setState({ searchTitle: name });
        }

        this.setState({ category: name }, () => { self.getItems(); });
    }

    render() {

        let cardClassName;
        if(this.state.viewportWidth < 700) {
            cardClassName = "col-3";
        } else {
            cardClassName = "col-2dot4";
        }

        let items;
        if(this.state.data.length > 0) {
            let cardWidth = this.state.cardWidth;
            let cardHeight = this.state.cardHeight;
            items = this.state.data.map(function(item, i) {
                return <div className={cardClassName}><ProductCard key={shortid.generate()} item={item} cardWidth={cardWidth} cardHeight={cardHeight} /></div>
            });
        }

        return(
            <>
                <NavigationBar term={this.state.searchterm} />
                <div className="row search-container">
                    <div className="col-3" style={{ backgroundColor: "#F6FAFF", border: "1px solid #E0E5EE", paddingRight: 0 }}>
                        <h5 className="search-filter-text">Filter</h5>
                        <TreeMenu data={this.state.categories} onClickItem={({ key, label, ...props }) => { this.categoryChange(label) }} />
                        <h5 className="search-filter-text">Price</h5>
                        <div class="bp3-input-group bp3-large price-input">
                            <span class="bp3-icon price-input">¥</span>
                            <input type="number" onBlur={this.onPriceInputBlur} onChange={this.onMinPriceChange} value={this.state.priceMin} class="bp3-input bp3-large" placeholder="Minimum Price" />
                        </div>
                        <div class="bp3-input-group bp3-large price-input">
                            <span class="bp3-icon price-input">¥</span>
                            <input type="number" onBlur={this.onPriceInputBlur} onChange={this.onMaxPriceChange} value={this.state.priceMax} class="bp3-input bp3-large" placeholder="Maximum Price" />
                        </div>
                    </div>
                    <div className="col-9">
                        <div className="row" style={{ marginTop: 20, paddingBottom: 0, paddingLeft: 30 }}>
                            { this.state.noItemFound && 
                                <Card style={{ width: "97.5%" }}>
                                    <img src={EmptyIllustration} />
                                    <H3 style={{ marginTop: 10 }}>
                                        Oops... No items found with the search term...
                                    </H3>
                                    <p>
                                        You can try with different filters and search term to yield the better search results
                                    </p>
                                </Card> 
                            }
                            { !this.state.noItemFound && <><div className="col-8">
                                <p className="search-title">Showing results of <span className="search-term">"{this.state.searchTitle}"</span> - {this.state.totalItems} item(s)</p>
                            </div>
                            <div className="col-4">
                                <p className="search-title">Showing results of <span className="search-term">"{this.state.searchTitle}"</span> - {this.state.totalItems} item(s)</p>
                            </div></>
                            }
                        </div>
                        <div className="row" style={{ padding: 30, paddingTop: 0, marginTop: 0 }}>
                            {items}
                        </div>
                        <div className={useStyles.root} style={{ marginBottom: 20 }} >
                            <Pagination count={this.state.totalPage} variant="outlined" onChange={this.handlePageChange} />
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
}

export default Search;