import React, {Component} from 'react';
import {Link, IndexLink} from 'react-router';
import {StaggeredMotion, spring} from 'react-motion';
import {SkillsData, skurl} from '/imports/api/data/skills-data';
import BreadCrumbsHeader from '../components/BreadCrumbsHeader.jsx';
import FooterTransition from '../components/FooterTransition.jsx';
import StaggeredName from '../components/StaggeredName.jsx'

const skillItem = skill => SkillsData.find(a => a.to === skurl(skill));

const skillResolver = (key, text) => skill => key === ':skill' ? skill : text;

const lastCrumbIsString = (link, key, text, index, routes) => {
  if (index === routes.length -1) {
    return <StaggeredName letters={text} key={key} />;
  }
  return <Link to={link} key={key}>{text}</Link>;
}

export default class Skill extends Component{
  constructor(props){
    super(props);
    this.state = {
      currentIndex: 0
    }
  }

  getContainerStyles(skill){
    const ci = this.state.currentIndex;
    let img = ci === 0 ? skill.overviewImg : skill.projects[ci-1].overviewImg;
    let _s = {
      position:"fixed",
      top:0,
      left:0,
      width:"100vw",
      height:"100%",
      bottom:0,
      backgroundSize:"cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition:"50% 50%"
    }

    if(img){
      _s.backgroundImage = `url(${img})`;
    }else{
      _s.backgroundColor = "#222"
    }

    return _s;
  }

  splitOnBreak(content){
    return content.split("<br />");
  }

  staggeredProps(contentArr){
    const p = [...contentArr];
    const _s = { stiffness: 900, damping: 50, precision:.1 }
    return {
      defaultStyles: p.map(() => ({t:50, o:0.1})),
      styles: prevInterpolatedStyles => prevInterpolatedStyles.map((_,i) => {
        return i === 0
              ? {t: spring(0, _s), o:spring(1, _s)}
              : {t: spring(prevInterpolatedStyles[i - 1].t, _s), o:spring(prevInterpolatedStyles[i - 1].o)}
      })
    }
  }

  staggeredStyle({t,o}){
    return {transform:`translate3d(0,${t}%,0)`, margin:"1rem auto 0 auto", opacity:o}
  }

  isSelected(idx){
    return this.state.currentIndex === idx ? "selected" : "";
  }

  navigateToProj(e,p, idx){
    e.preventDefault();
    this.setState({currentIndex: idx});
  }

  computePositionStyles(idx){
    const ci = this.state.currentIndex,
          base = 100,
          opacity = ci === idx ? 1 : .1;
    let pos, ret;

    pos = (-base * (ci-idx)) -50;
    ret = {
      // transform: `translate3d(${pos}%,0,0)`,
      // opacity
    }
    return ret;
  }

  render(){
    const {routes, params} = this.props;
    const skill = skillItem(params.skill);
    const projs = skill.projects;
    return (
      <div role="main" style={this.getContainerStyles(skill)}>
        <BreadCrumbsHeader
          routes={routes}
          params={params}
          goBack={this.props.router.goBack}
          resolver={skillResolver}
          crumbs={skill.title}
          style={{background:"#111"}}
          lastCrumbResolver={lastCrumbIsString}
        />
        <div style={this.computePositionStyles(0)} className="content with-breadcrumbs with-footer">
          <div className="scroll-y">
            {this.state.currentIndex === 0 && <StaggeredMotion {...this.staggeredProps(this.splitOnBreak(skill.overview))}>
              {interpolatedStyles =>
                <article className="single-post skill-description" style={{backgroundImage:"url(/skill-bg.svg)", backgroundSize:"cover"}}>
                  {interpolatedStyles.map((style, i) => (
                    <p
                      key={i}
                      style={this.staggeredStyle(style)}
                      dangerouslySetInnerHTML={{__html: this.splitOnBreak(skill.overview)[i]}}
                    />
                  ))}
                </article>
              }
            </StaggeredMotion>}
          </div>
        </div>
        {projs.map((p, i) => (
          <div key={i+1} style={this.computePositionStyles(i+1)} className="content with-breadcrumbs with-footer">
            <div className="scroll-y">
              {this.state.currentIndex === i+1 && <StaggeredMotion {...this.staggeredProps(this.splitOnBreak(p.overview))}>
                {interpolatedStyles =>
                  <article className="single-post skill-description" style={{backgroundImage:"url(/skill-bg.svg)", backgroundSize:"cover"}}>
                    {interpolatedStyles.map((style, i) => (
                      <p
                        key={i}
                        style={this.staggeredStyle(style)}
                        dangerouslySetInnerHTML={{__html: this.splitOnBreak(p.overview)[i]}}
                      />
                    ))}
                  </article>
                }
              </StaggeredMotion>}
            </div>
          </div>
        ))}
        <FooterTransition>
          <ul className="bottom-tabs" style={{maxWidth:`${(projs.length + 1) * 170}px`}}>
            <li>
              <a href={skill.to} className={this.isSelected(0)} onClick={(e) => this.navigateToProj(e, skill, 0)}>
                Overview
              </a>
            </li>
            {projs.map((p, i) => (
              <li key={p.path}>
                <a className={this.isSelected(i+1)} onClick={(e) => this.navigateToProj(e,p, i+1)} href={p.path}>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </FooterTransition>
      </div>
    )
  }
}
