import React, { Fragment, useEffect, useState } from "react";
import { Link, navigate } from "gatsby";
import useTopNavigation from "../hooks/use-top-navigation";
import useBottomNavigation from "../hooks/use-bottom-navigation";
import { Menu, message, Input } from "antd";
import "./base-component.css";
import { getProductList } from "../service";
import image from "../logo/logo.webp";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useCookies } from "react-cookie";

// const { Sider } = Layout;

const openNotification = (type, messageText) => {
  if (type === "error" || type === "delete") {
    message.error(messageText);
  } else if (type === "warning") {
    message.info(messageText);
  } else {
    message.success(messageText);
  }
};
const RootElement = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["SHOP_TOKEN"]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [productList, setProductList] = useState([]);
  const [noProductFoundError, SetNotProductFoundError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("myCat", "Tom");
    }
    const user = localStorage && localStorage.getItem("loggedUserBc");
    if (user) {
      console.log(cookies);
      console.log(user);
      setUserDetails(JSON.parse(user));
    }
  }, [cookies, typeof window]);
  // const location = useLocation();
  // console.log(location)
  const topNavigation = useTopNavigation();
  const bottomNavigation = useBottomNavigation();

  const onLogout = () => {
    removeCookie();
    localStorage.setItem("loggedUserBc", "");
    setUserDetails(null);
    openNotification("sucess", "Successfully logged out");
  };

  const onCloseSearch = () => {
    setShowSearch(false);
    SetNotProductFoundError(false);
    setProductList([]);
  };

  const onSearch = (e) => {
    onCloseSearch();
    window.location.replace(`/search/?search_query=${encodeURIComponent(e.target.value)}`)
    console.log(e.target.value);
  };

  const searchOnChange = async (e) => {
    setSearchText(e.target.value);
    if (e.target.value && e.target.value.length >= 3) {
      try {
        const product = await getProductList({ keyword: e.target.value });
        setProductList(product.data || []);
        if (!product.data || !product.data.length) {
          SetNotProductFoundError(true);
        } else {
          SetNotProductFoundError(false);
        }
      } catch (e) {
        SetNotProductFoundError(true);
        console.log(e);
      }
    } else {
      SetNotProductFoundError(false);
      setProductList([]);
    }
  };
  const sideBar = {
    label: "Quick Links",
    children: topNavigation.map((item, index) => {
      const key = String(index + 1);
      const returnObj = {
        key: `sub${key}`,
        label: <Link to={`/${item.pageUrl}`}>{item.title}</Link>,
      };
      const children =
        item.sublink &&
        item.sublink.length &&
        item.sublink.map((item, index) => {
          return {
            key: `child${key}`,
            label: <Link to={`/${item.pageUrl}`}>{item.title}</Link>,
          };
        });
      returnObj.children = children;
      return {
        ...returnObj,
      };
    }),
  };
  return (
    <Fragment>
      <div class="fixed-header">
        <div class="container">
          <nav>
            <ul id="nav">
              <li>
                {React.createElement(
                  collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                  {
                    className: "trigger",
                    onClick: () => setCollapsed(!collapsed),
                  }
                )}
                <Link to={"/"}>
                  <img src={image} />
                </Link>
              </li>
              {showSearch ? (
                <>
                  <div>
                    <Input
                      placeholder="Search the store"
                      onChange={searchOnChange}
                      onPressEnter={onSearch}
                    />
                    <span onClick={onCloseSearch}>
                      <CloseOutlined />
                    </span>
                    {productList && productList.length ? (
                      <div className="search-product-list">
                        <ul>
                          {productList.map((item) => {
                            return (
                              <li>
                                <div>
                                  <div>
                                    <Link
                                      to={`/products${item.custom_url.url}`}
                                    >
                                      <img
                                        src="https://www.junglescout.com/wp-content/uploads/2021/01/product-photo-water-bottle-hero.png"
                                        width="66"
                                        alt={item.name}
                                        height="66"
                                      />
                                    </Link>
                                  </div>
                                  <div>
                                    <p>
                                      <Link
                                        to={`/products${item.custom_url.url}`}
                                      >
                                        {item.name}
                                      </Link>
                                    </p>
                                    <p>
                                      {item.price.toLocaleString(
                                        "en-US",
                                        {
                                          style: "currency",
                                          currency: "USD",
                                          minimumFractionDigits: 0,
                                        }
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : <>
                      {
                        noProductFoundError ? <span>0 product results for '{searchText}'</span> : null
                      }
                    </>}
                  </div>
                </>
              ) : (
                <>
                  {topNavigation.map((item, index) => {
                    const { pageUrl, title, sublink } = item;
                    return (
                      <li>
                        <Link to={`/${pageUrl}`}>
                          {title}{" "}
                          {sublink && sublink.length && <DownOutlined />}
                        </Link>
                        {sublink && sublink.length ? (
                          <ul>
                            {sublink.map((link) => {
                              return (
                                <li>
                                  <Link to={`/${link.pageUrl}`}>
                                    {link.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                  {userDetails ? (
                    <>
                      <span>Hey, {userDetails.firstName} </span>{" "}
                      <span onClick={onLogout}>Logout</span>
                    </>
                  ) : (
                    <li>
                      {/* <Button onClick={onLogin}>Login</Button> */}
                      <Link to={"/login"}>Login</Link>
                    </li>
                  )}
                  <span onClick={() => setShowSearch(true)}>
                    <SearchOutlined />
                  </span>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
      <div
        class="container"
        style={{
          marginTop: "100px",
          marginBottom: "500px",
          paddingBottom: "200px",
        }}
      >
        {!collapsed && (
          <div>
            <Menu
              mode="inline"
              style={{
                height: "100%",
              }}
              items={[sideBar]}
            />
          </div>
        )}
        {children}
      </div>
      <div class="fixed-footer">
        <div class="container">
          <div>
            <span>Lorem ipsum dolor sit amet, consectetur, LA 62303</span>
            <span>
              <a href="tel:636-377-2140">636-377-2140</a>
            </span>
          </div>
          <h3>Quick Links</h3>
          <ul>
            {topNavigation.map((item, index) => {
              const { pageUrl, title } = item;
              return (
                <li>
                  <Link to={`/${pageUrl}`}>{title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default RootElement;
