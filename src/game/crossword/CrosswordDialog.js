import React, {useState, useEffect, useRef} from 'react';
import cx from 'classnames';
import { makeStyles } from "@material-ui/styles";
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const useStyles = makeStyles(theme => ({
    dialog: {
        position: "absolute",
        overflow: "auto",
        // border: "1px solid red",
        width: 200,
        height: 110,
    },
    dialog0: {
        top: 18,
        left: 175,
    },
    dialog1: {
        left: 23,
        top: 167,
    },
    image: {
        width: "100%"
    },
    p: {
        marginBottom: "0.5em"
    }
}));

function progressState(state) {
    const {posts, postIndex, charIndex} = state;
    const post = posts[postIndex];
    const isLastPost = postIndex === posts.length - 1;
    const isLastChar = charIndex === post.text.length - 1;
    if (isLastPost && isLastChar) {
        return state;
    } else if (isLastChar) {
        return {
            ...state,
            postIndex: postIndex + 1,
            charIndex: 0
        };
    } else {
        return {
            ...state,
            postIndex,
            charIndex: charIndex + 1
        };
    }
}

function usePostTyper(posts, image) {
    const initialState = {
        posts,
        postIndex: 0,
        charIndex: 0
    };
    const [state, setState] = useState(initialState);

    useEffect(() => {
        if (posts !== state.posts) {
            setState(initialState);
        } else {
            const nextState = progressState(state);
            // console.log("Progress to", nextState);
            if (nextState !== state) {
                let timeout;
                if (nextState.postIndex !== state.postIndex) {
                    const delay = posts[nextState.postIndex].delay || 500;
                    timeout = setTimeout(() => setState(nextState), delay);
                } else if (nextState.charIndex !== state.charIndex) {
                    timeout = setTimeout(() => setState(nextState), 20);
                }
                return () => clearTimeout(timeout);
            }
        }
    });

    const postsByPeople = [];
    for (let i = 0; i <= state.postIndex; i++) {
        const post = state.posts[i];
        const postText = state.postIndex === i ? 
            post.text.substr(0, state.charIndex + 1) :
            post.text;
        
        let postsByPerson = postsByPeople[post.personIndex] || [];
        postsByPerson.push(postText);
        postsByPeople[post.personIndex] = postsByPerson;
    }

    return postsByPeople;
}

export default function CrosswordDialog({
    posts,
    className,
    image
}) {
    const classes = useStyles();
    const typedPosts = usePostTyper(posts);

    const personIndexes = [0, 1];
    const ref = useRef();

    useEffect(() => {
        if (ref.current) {
            ref.current.querySelectorAll('.scrollbar-container').forEach(c => {
                c.scrollTop = c.scrollHeight;
            });
        }
    }, [typedPosts]);

    return (
        <div className={className} ref={ref}>
            <img className={classes.image} src={image} alt="Talk"></img>
            {personIndexes.map(personIndex => {
                const personPosts = typedPosts[personIndex] || [];
                return (
                    <div key={personIndex} className={cx(classes.dialog, classes[`dialog${personIndex}`])}>
                        <PerfectScrollbar>
                            {personPosts.map((postText, i) => 
                                <Typography className={classes.p} key={i}>{postText}</Typography>
                            )}
                        </PerfectScrollbar>
                    </div>
                )
            })}
        </div>
    );
}

CrosswordDialog.propTypes = {
    posts: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            personIndex: PropTypes.number.isRequired,
            delay: PropTypes.number
        })
    ),
    image: PropTypes.string
}