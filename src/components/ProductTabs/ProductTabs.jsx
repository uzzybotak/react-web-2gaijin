import React, { Component, FunctionComponent } from "react";
import {
    Tab, TabId, Tabs
} from "@blueprintjs/core";
import axios from "axios";
import shortid from "shortid";
import FullWidthCard from "../FullWidthCard";

class ProductTabs extends Component {

    constructor(props) {
        super(props);
        this.state = {
            recentItems: [],
            freeItems: []
        }
    }

    componentWillMount() {
        let config = {
            headers: { },
            params: {
              start: 1,
              limit: 9,
              sortby: "newest",
              status: "available"
            }
        }
  
        axios
        .get(`https://go.2gaijin.com/search`, config)
        .then(response => {
            if(response.data.status == "Success") { 
                this.setState({ recentItems: response.data.data.items });
            }
        });

        config = {
            headers: { },
            params: {
              start: 1,
              limit: 9,
              pricemax: 0,
              status: "available",
              sortby: "newest"
            }
        }
  
        axios
        .get(`https://go.2gaijin.com/search`, config)
        .then(response => {
            if(response.data.status == "Success") { 
                this.setState({ freeItems: response.data.data.items });
            }
        });
    }

    render() {
        if(typeof(this.state.recentItems) === "undefined" ) {
            return "";
        }

        return (
            <Tabs
                animate={true}
                id="TabsExample"
                key={"horizontal"}
                renderActiveTabPanelOnly={true}
                vertical={false}
                style={{ borderBottom: "1px solid blue" }}
                >
                <Tab id="recentitems" title="Recently Added Items" panel={<ProductPanel items={this.state.recentItems} />} />
                <Tab id="freeitems" title="Free Items" panel={<ProductPanel items={this.state.freeItems} />} />
            </Tabs>
        )
    }
}

const ProductPanel = (props) => (
    <div className="row" style={{ margin: 0 }}>
        { props.items.map(function (item, i) {
            return (
                <div className="col-2dot4">
                    <FullWidthCard key={shortid.generate()} item={item} visibleItems={5} />
                </div>
            );
        })}
        <div className="col-2dot4">
            <FullWidthCard key={shortid.generate()} visibleItems={5} viewAll viewAllLink="/search/Electronics" />
        </div>
    </div>
);

export default ProductTabs;