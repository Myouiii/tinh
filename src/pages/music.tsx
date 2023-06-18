import IORedis from 'ioredis';
import dayjs from 'dayjs';
import ms from 'ms';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useLanyardWS } from 'use-lanyard';
import { useEffect, useState } from 'react';
import SpotifyWebAPI from 'spotify-web-api-node';
import Image from "next/image"
import type { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { HiExternalLink } from 'react-icons/hi';
// @ts-ignore
import TailwindColor from '@videsk/tailwind-random-color';
import { MdExplicit } from 'react-icons/md';
import { SiSpotify } from 'react-icons/si';
import Modal from '../components/Modal';
import ModalSpotify from '../components/Spotify';
import api from '../pages/api/spotify/oauth';
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import AlbumObjectFull = SpotifyApi.AlbumObjectFull;
import PlayHistoryObject = SpotifyApi.PlayHistoryObject;
import UserObjectPublic = SpotifyApi.UserObjectPublic;
import ListOfUsersPlaylist = SpotifyApi.ListOfUsersPlaylistsResponse;
import FollowedArtists = SpotifyApi.UsersFollowedArtistsResponse;
import CurrentPlayingTrack = SpotifyApi.CurrentlyPlayingResponse;
import type { LastFMGetTrack } from '../server/last-fm';
import { LastFM } from '../server/last-fm';
import {
	LAST_FM_API_KEY,
	REDIS_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIS_KEYS,
} from '../server/constants';
import Details from '../components/Details';
import AudioMusic from '../components/AudioMusic';
import { classNames } from '../util/classNames';
import { getAccessibleColor, getRGBColor } from '../util/color';
import { rand } from '../util/types';
type Props = {
	user: any;
	topTracks: TrackObjectFull[];
	playLists: any;
	following: any;
	userLanyard: any;
	randomLastFMTrack: LastFMGetTrack;

	//topTracks: PlayHistoryObject[];
};

dayjs.extend(relativeTime);
export default function MusicPage({
	user,
	topTracks,
	playLists,
	following,
	userLanyard,
	randomLastFMTrack,
}: Props) {
	const image = user.images[0].url;

	//console.log(JSON.stringify(userLanyard, null, 4));

	return (
		<motion.div
			initial={{ opacity: 0, y: 7 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -4 }}
			transition={{ ease: 'easeInOut', duration: 0.4 }}
			className="mt-24 w-full mb-32"
		>
			<div className="mt-36 ">
				<div className="flex justify-center ">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						transition={{ ease: 'easeInOut', duration: 1 }}
					>
						<div className="relative hover:scale-105 hover:-translate-x-5 transition duration-500 hover:ease-out">
							<Image
								src={image}
								className="pointer-events-none rounded-full drop-shadow-md h-auto"
								alt={`${user.display_name}`}
								width={150}
								height={150}
								loading="lazy"
								decoding="async"
							/>
						</div>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 50 }}
						transition={{ ease: 'easeInOut', duration: 1 }}
						className="sm:px-4 px-2 whitespace-nowrap"
					>
						<span>PROFILE</span>
						<a
							href={user.external_urls.spotify}
							target="_blank"
							className="w-full font-bold text-gray-900 dark:text-[#e1eafd] truncate"
						>
							<h1 className="text-6xl">{user.display_name}</h1>
						</a>
						<a
							href={`${user.external_urls.spotify}/followers`}
							target="_blank"
							className="w-full font-medium text-gray-900 dark:text-[#e1eafd] hover:underline truncate"
						>
							<p>● {user.followers?.total} Followers</p>
						</a>
						<a
							href={`${user.external_urls.spotify}/following`}
							target="_blank"
							className="w-full font-medium text-gray-900 dark:text-[#e1eafd] hover:underline truncate"
						>
							<p>● {following} Following</p>
						</a>
						<a
							href={`${user.external_urls.spotify}/playlists`}
							target="_blank"
							className="w-full font-medium text-gray-900 dark:text-[#e1eafd] hover:underline truncate"
						>
							<p>● {playLists} Public Playlists</p>
						</a>
					</motion.div>
				</div>
				<div className="w-full">
					<ModalSpotify user={userLanyard} />
				</div>
				<div className="mx-4">
					<div className="mt-4 mb-6 ">
						Listening to music is my cup of tea. I listen to many different kinds of music. Most of
						the time, I love listening to music. Here are some of the songs I listen to the most in
						recent months.
						<br />
						I've listened to{' '}
						<div
						className="font-bold text-lg scale-100 hover:scale-95 inline-block transition duration-200 hover:ease-out"
						>
							<a className="" href={randomLastFMTrack.url} target="_blank">
								{randomLastFMTrack.name}
							</a>
						</div>{' '}by{' '}
						<div
							className="font-bold text-lg scale-100 hover:scale-95 inline-block transition duration-200 hover:ease-out"
						>
							<a href={randomLastFMTrack.artist.url} target="_blank">
								{randomLastFMTrack.artist.name}
							</a>
						</div>{' '}about{' '}
						<span className="font-bold text-lg underline">{randomLastFMTrack.playcount}</span> times a month!
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 gap-y-8 md:grid-cols-3">
				{topTracks.map((track) => (
					//<Track key={track.id} track={track} />
					<Track key={track.id} track={track} />
				))}
			</div>
		</motion.div>
	);
}
function Track({ track }: { track: TrackObjectFull /* PlayHistoryObject */ }) {
	const [statsOpen, setStatsOpen] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const options = {
		colors: ['yellow', 'orange', 'blue', 'cyan', 'purple', 'emerald'],
		range: [4, 4], // Between 400 and 400,
		prefix: 'shadow',
	};
	const [ranDom, setRanDom] = useState('shadow-blue-400');
	const onLoadCallback = () => {
		setIsReady(true);
	};

	const image = track.album.images[0].url;
	const artists = track.artists.map((artist) => artist.name).join(', ');

	const close = () => {
		setStatsOpen(false);
	};

	const open = () => {
		setStatsOpen(true);
	};

	const changeRandom = () => {
		const randomColor = new TailwindColor(options).pick();
		// const randomColor = Math.floor(Math.random() * 16777215).toString(16);
		//console.log(randomColor);
		setRanDom(randomColor);
	};
	const album = track.album as AlbumObjectFull;

	return (
		<button
			key={track.id}
			type="button"
			className="group flex flex-col space-y-2 text-left align-top no-underline outline-none
			focus:outline-none focus:ring-amber-100 p-[2px] 
			focus:ring-4 dark:focus:ring-gray-200"
			onClick={open}
			onMouseLeave={changeRandom}
		>
			<Modal isOpen={statsOpen} setIsOpen={close} title={<SiSpotify size={24} />}>
				<div className="space-y-4">
					<div className="relative aspect-[3/2] ">
						<Image
							src={image}
							layout="fill"
							alt={`${track.album.name} by ${artists}`}
							className={`rounded-md object-cover pointer-events-none transition -z-[10]  w-full h-auto
							bg-gray-200 
							duration-700 ${isReady ? 'scale-100 bg-gray-200 blur-0' : 'scale-110 blur-2xl'}`}
							loading="lazy"
							decoding="async"
							onLoadingComplete={onLoadCallback}
						/>
					</div>
					{track.preview_url ? (
						<AudioMusic src={track.preview_url || ''} />
					) : (
						<p className="text-sm italic flex justify-end">*preview not available</p>
					)}

					<a
						href={track.external_urls.spotify}
						className="group flex justify-between rounded-md border 
						bg-gray-400  p-3 no-underline dark:border-0 dark:bg-neutral-400"
						target="_blank"
						rel="noreferrer"
					>
						<div className="w-[90%]">
							<h2 className="md:text-2xl text-xl font-bold group-hover:underline truncate">
								{track.name}
							</h2>
							<h3 className="text-sm italic text-gray-800 dark:text-gray-800">by {artists}</h3>
						</div>

						<HiExternalLink size={24} />
					</a>

					<>
						<Details
							details={[
								{
									name: 'Released:',
									value: (
										<span>
											{dayjs(album.release_date).fromNow()} (
											{dayjs(album.release_date).format('MMM D, YYYY')})
										</span>
									),
								},
								{
									name: 'Album:',
									value: album.name,
								},
								{
									name: 'Duration:',
									value: ms(track.duration_ms, { long: true }),
								},
							]}
						/>
					</>

					<button
						onClick={close}
						className="float-right !mt-0 hover:bg-slate-400 py-1 px-2 rounded-lg"
					>
						Close
					</button>
				</div>
			</Modal>

			<div className={`w-full transition-all group-hover:shadow-lg group-hover:${ranDom}`}>
				<Image
					src={image}
					className={`pointer-events-none rounded-lg md:brightness-90 brightness-105 scale-100 
					transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 
					${isReady ? 'scale-100 bg-gray-400 blur-0' : 'scale-120 blur-2xl'}
					`}
					alt={`${track.name} by ${artists}`}
					width={400}
					height={400}
					loading="lazy"
					decoding="async"
					sizes="100vw"
					onLoadingComplete={onLoadCallback}
				/>
			</div>

			<div className="truncate w-full">
				<ul className="py-0.5 text-lg contents items-center mt-4">
					<li className="truncate font-bold w-full ">
						{track.explicit && <MdExplicit className="-mt-1 inline" />} {track.name}
					</li>{' '}
					<li className="truncate w-full text-gray-600 dark:text-neutral-200/70">by {artists}</li>
				</ul>
			</div>
		</button>
	);
}
export const getStaticProps: GetStaticProps<Props> = async () => {
	const redis = new IORedis(REDIS_URL || '');

	const [token, refresh] = await redis.mget(
		SPOTIFY_REDIS_KEYS.AccessToken,
		SPOTIFY_REDIS_KEYS.RefreshToken
	);

	let api: SpotifyWebAPI;
	let revalidate = 120;

	if (!token && refresh) {
		// If we don't have a token but we do have a refresh token
		api = new SpotifyWebAPI({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			refreshToken: refresh,
		});

		const result = await api.refreshAccessToken();

		await redis.set(
			SPOTIFY_REDIS_KEYS.AccessToken,
			result.body.access_token,
			'EX',
			// Expires is in seconds as per https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
			result.body.expires_in
		);

		// We should revalidate when the token expires
		// but we can do it slightly before
		revalidate = result.body.expires_in - 30;

		// If spotify wants us to use a new refresh token, we'll need to update it
		if (result.body.refresh_token) {
			await redis.set(SPOTIFY_REDIS_KEYS.RefreshToken, result.body.refresh_token);
		}
	} else if (token) {
		api = new SpotifyWebAPI({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			accessToken: token,
		});
		//console.log(api);
	} else {
		throw new Error(
			'No Spotify tokens available! Please manually add them to the Redis store to allow tokens to refresh in the future.'
		);
	}

	/* Top tracks playing */
	const tracks = await api.getMyTopTracks({ time_range: 'short_term', limit: 42 });
	/* Get me */
	const user = await api.getMe();
	delete user.body.email;
	delete user.body.explicit_content;
	delete user.body.country;
	delete user.body.href;

	/* Get getMyCurrentPlayingTrack*/

	const track = await api.getMyCurrentPlayingTrack();

	/* getUserPlaylists */
	const playlists = await api.getUserPlaylists(user.body.id);
	const followings = await api.getFollowedArtists(1);

	/* RecentlyPlayedTracks */
	//const tracks = await api.getMyRecentlyPlayedTracks({ limit: 20, after: 1484811043508 });

	await redis.quit();
	const lfm = new LastFM(LAST_FM_API_KEY);
	let topLFMTracks = await lfm.getTopTracks('loonailysm', '1month', 6);
	topLFMTracks = topLFMTracks.map((item) => ({
		name: item.name,
		url: item.url,
		artist: item.artist,
		'@attr': item['@attr'],
		playcount: item.playcount,
		duration: item.duration,
	}));
	return {
		props: {
			user: user.body,
			topTracks: tracks.body.items,
			playLists: playlists.body.total,
			following: followings.body.artists.total,
			randomLastFMTrack: rand(topLFMTracks),
		},
		revalidate,
	};
};
